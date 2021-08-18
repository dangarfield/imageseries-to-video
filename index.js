#!/usr/bin/env node

const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const cliProgress = require('cli-progress')
const chalk = require('chalk')
const _colors = require('colors')
const argv = require('minimist')(process.argv.slice(2))

const settings = {
    folderPath: process.cwd(),
    firstFrameRegexParam: '-[0]{2,3}.png',
    videoRegexParam: '.mp4',
    videoCodec: 'libx264',
    pixFmt: 'yuv420p',
    fps: '30'
}

const replaceLast = (string, target, replacement) => {
    if(string.indexOf(target) < 0) {
        return string
    }
    let pcs = string.split(target)
    let lastPc = pcs.pop()
    return pcs.join(target) + replacement + lastPc
}

const getGroupedFiles = () => {
    const allFiles =  fs.readdirSync(settings.folderPath)
    const firstFrameRegex = new RegExp(settings.firstFrameRegexParam, 'g')
    const firstFrameFiles = allFiles.filter((f => f.match(firstFrameRegex)))

    console.log(chalk`{cyan INFO:} Image Series To Video - {green ${firstFrameFiles.length} image series}`)

    if(settings.fps !== '30') {
        settings.videoRegexParam = `_${settings.fps}${settings.videoRegexParam}`
    }
    const groupedFiles = firstFrameFiles.map((firstFrameFile) => {
        // Individual image series file list is not required, may be helpful in the future
        // const seriesRegexString = firstFrameFile.replace(firstFrameRegex, seriesRegexParam)        
        // const seriesRegex = new RegExp(seriesRegexString, 'g')
        // const seriesFiles = allFiles.filter((f => f.match(seriesRegex)))
        // console.log('seriesFiles', seriesFiles, seriesRegexString)
        
        const videoRegexString = firstFrameFile.replace(firstFrameRegex, settings.videoRegexParam)
        
        let seriesRegexFFMPegString = replaceLast(firstFrameFile, '000.', '%03d.')
        seriesRegexFFMPegString = replaceLast(firstFrameFile, '00.', '%02d.')
        
        return {
            firstFrame: firstFrameFile,
            seriesRegex: path.join(settings.folderPath, seriesRegexFFMPegString),
            video: path.join(settings.folderPath, videoRegexString)
        }
    })
    return groupedFiles
}
let progressBar
let processedTotal

const createVideo = (groupedFile) => {
    return new Promise(resolve => {
        ffmpeg().input(groupedFile.seriesRegex)
        .withFpsInput(settings.fps)
        .videoCodec(settings.videoCodec)
        .outputOptions(`-pix_fmt ${settings.pixFmt}`)
        .output(groupedFile.video)
        .on('end', function() {
            processedTotal++
            progressBar.update(processedTotal)
            resolve()
          })
        .run()
    })

    
}
const createVideos = async (groupedFiles) => {
    progressBar = new cliProgress.SingleBar({
        format: _colors.cyan('INFO: ') + 'Processing... |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Videos',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      })
    progressBar.start(groupedFiles.length, 0)
    processedTotal = 0
    
    for (let i = 0; i < groupedFiles.length; i++) {
        await createVideo(groupedFiles[i])
    }
    progressBar.stop()
}
const updateParams = () => {
    if (argv.h) {
        console.log(chalk`{cyan HELP:} {green Image Series To Video}`)
        console.log(chalk`{cyan HELP:} Run the {blue i2v} command from any directory to convert image series into movies. Default settings:`)
        console.log(chalk`{cyan HELP:} Note: ffmpeg must be installed`)
        console.log(chalk`{cyan HELP:} {blue -r 30} - Framerate to encode, default 30. Non 30 value (eg, 15) change the video output format to _15.mp4`)
        console.log(chalk`{cyan HELP:} {blue -f '-[0]\{2,3\}.png'} - First frame regex, eg matches any-file{green -00.png}. {red Wrap with single quotes}`)
        console.log(chalk`{cyan HELP:} {blue -v .mp4} - Output file name, replaces first frame regex, eg any-file{green .mp4}`)
        console.log(chalk`{cyan HELP:} {blue -c libx264} - Video codec`)
        console.log(chalk`{cyan HELP:} {blue -p yuv420p} - Pixel format (ffmpeg -> pix_fmt)`)
        process.exit(0)
    }
    if (argv.r) {
        settings.fps = '' + argv.r
    }
    if (argv.f) {
        settings.firstFrameRegexParam = argv.f.replace(/\'/g,'')
    }
    if (argv.v) {
        settings.videoRegexParam = argv.v
    }
    if (argv.c) {
        settings.videoCodec = argv.c
    }
    if (argv.p) {
        settings.pixFmt = argv.p
    }

    console.log(chalk`{cyan INFO:} Path:     {blue ${settings.folderPath}}`)
    console.log(chalk`{cyan INFO:} Settings: -r {blue ${settings.fps}} -f {blue ${settings.firstFrameRegexParam}} -v {blue ${settings.videoRegexParam}} -c {blue ${settings.videoCodec}} -p {blue ${settings.pixFmt}}`)
}
const init = async () => {
    updateParams()
    let groupedFiles = getGroupedFiles()
    await createVideos(groupedFiles)
}
init()
# Image Series to Video CLI Tool
> CLI for quickly and automatically creating videos from image series within a folder. Multiple image series within a single folder are automatically detected

![alt text](https://i.ibb.co/tpqcP4s/i2v-demo.gif "Image Series to Video CLI Tool")

## Installation and usage
- Install [node js](https://nodejs.org/en/download/)
- Run `npm i -g imageseries-to-video` to install the tool
- Run `i2v` from cmd line in any folder of your choice to 

## Help
- Running `i2v -h` will provide you with a list of configuration options should you not wish to use the default

```
HELP: Image Series To Video
HELP: Run the i2v command from any directory to convert image series into movies. Default settings:
HELP: Note: ffmpeg must be installed
HELP: -r 30 - Framerate to encode, default 30. Non 30 value (eg, 15) change the video output format to _15.mp4 
HELP: -f '-[0]{2,3}.png' - First frame regex, eg matches any-file-00.png. Wrap with single quotes
HELP: -v .mp4 - Output file name, replaces first frame regex, eg any-file.mp4
HELP: -c libx264 - Video codec
HELP: -p yuv420p - Pixel format (ffmpeg -> pix_fmt)
```
#!/bin/bash

model=$1
iteration=$2
version=$3
mi=$model
if [ "$iteration" != "" ]
then
	mi="$mi-$iteration"
fi
repo="iron-iot-$mi"

echo "requesting latest $repo release url"
url=`curl \
		-H "Accept: application/vnd.github.v3+json" \
		$GITHUB_API_URI/repos/ironman9967/$repo/releases/latest | \
	grep -o 'tarball_url.*' | \
	grep -o 'http[^",]*'
`

echo "downloading release from $url"

if [ "$version" == "" ]
then
	version=`echo $url | grep -o '[^/]*$'`
fi
filename="prebuild_${mi}_app_$version.tar.gz"
rm -rf $filename

echo "downloading $repo release $version"
`wget -O $filename $url`

echo "download complete - $filename"

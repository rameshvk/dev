package linkinfo

import (
	"errors"
	"gopkg.in/h2non/bimg.v1"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type ImageInfo struct {
	ImageUrl          string
	MimeType          string
	Width, Height     int
	LocalTempFilePath string
}

func GetImageInfo(url, tmpDir string) (*ImageInfo, error) {
	file, err := ioutil.TempFile(tmpDir, "image_")
	if err != nil {
		return nil, err
	}
	filePath := file.Name()
	file.Close()

	if resp, err := http.Get(url); err != nil {
		return nil, err
	} else if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return nil, errors.New("Unexpected Status Code: " + resp.Status)
	} else {
		defer resp.Body.Close()
		out, err := os.Create(filePath)
		if err != nil {
			return nil, err
		}
		defer out.Close()
		_, err = io.Copy(out, resp.Body)
		if err != nil {
			os.Remove(filePath)
			return nil, err
		}
		ii := &ImageInfo{ImageUrl: url, LocalTempFilePath: filePath}
		ii.MimeType = getMimeTypeFromResponse(resp.Header)
		if err = ii.fillDetails(); err != nil {
			os.Remove(filePath)
			return nil, err
		}
		return ii, nil
	}
}

func (ii *ImageInfo) fillDetails() error {
	if buffer, err := bimg.Read(ii.LocalTempFilePath); err != nil {
		return err
	} else {
		img := bimg.NewImage(buffer)
		size, _ := img.Size()
		ii.Width = size.Width
		ii.Height = size.Height
		return nil
	}
}

func (ii *ImageInfo) Resize(sizes [][]int) ([]ImageInfo, error) {
	infos := []ImageInfo{}
	buf, err := ioutil.ReadFile(ii.LocalTempFilePath)
	if err != nil {
		return nil, err
	}

	for _, size := range sizes {
		sizeString := strings.Join(
			[]string{strconv.Itoa(size[0]), strconv.Itoa(size[1])},
			"_",
		)
		info := ImageInfo{
			ImageUrl:          "",
			MimeType:          "image/jpeg",
			Width:             size[0],
			Height:            size[1],
			LocalTempFilePath: ii.LocalTempFilePath + "_" + sizeString,
		}
		options := bimg.Options{
			Enlarge:    info.Width > ii.Width || info.Height > ii.Height,
			Embed:      true,
			Extend:     bimg.ExtendBackground,
			Width:      info.Width,
			Height:     info.Height,
			Background: bimg.Color{255, 255, 255},
			Type:       bimg.JPEG,
		}

		resized, err := bimg.Resize(buf, options)
		if err == nil {
			err = bimg.Write(info.LocalTempFilePath, resized)
		}
		if err == nil {
			infos = append(infos, info)
		} else {
			os.Remove(info.LocalTempFilePath)
			for _, info = range infos {
				os.Remove(info.LocalTempFilePath)
			}
			return nil, err
		}
	}

	return infos, nil
}

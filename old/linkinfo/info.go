package linkinfo

import (
	"io/ioutil"
	"net/http"
	"os"
)

type VideoInfo struct {
	VideoUrl string
	MimeType string
	Width    int
	Height   int
}

type Info struct {
	CanonicalUrl string
	Title        string
	Description  string
	SiteName     string
	Images       []ImageInfo
	Videos       []VideoInfo
}

// GetInfo scrapes the URL and makes a guess of what the URL
// contains.  In particular, only one of the XYZInfo objects
// will be filled in based on what the url represents
// tmpDir is optional
func GetInfo(url, tmpDir string) (*Info, error) {
	mimeType, err := getUrlMimeType(url)
	if err != nil {
		return nil, err
	}

	if mimeType == "text/html" {
		client := &http.Client{}

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Add("User-Agent", "facebookexternalhit/1.1")
		if resp, err := client.Do(req); err != nil {
			return nil, err
		} else {
			defer resp.Body.Close()
			if bytes, err := ioutil.ReadAll(resp.Body); err != nil {
				return nil, err
			} else if linkInfo, err := ParseLinkInfo(bytes, url); err != nil {
				return nil, err
			} else if images, err := imageUrlsToImages(linkInfo.ImageUrls, tmpDir); err != nil {
				return nil, err
			} else {
				info := Info{
					CanonicalUrl: linkInfo.CanonicalUrl,
					Title:        linkInfo.Title,
					Description:  linkInfo.Description,
					SiteName:     linkInfo.SiteName,
					Images:       images,
					Videos:       linkInfo.Videos,
				}
				return &info, nil
			}
		}
	} else if isImageType(mimeType) {
		if imageInfo, err := GetImageInfo(url, tmpDir); err != nil {
			return nil, err
		} else {
			info := Info{
				CanonicalUrl: url,
				SiteName:     getSiteName(url),
				Images:       []ImageInfo{*imageInfo},
			}
			return &info, nil
		}
	} else if isVideoType(mimeType) {
		vinfo := VideoInfo{VideoUrl: url, MimeType: mimeType}
		info := Info{
			CanonicalUrl: url,
			SiteName:     getSiteName(url),
			Videos:       []VideoInfo{vinfo},
		}
		return &info, nil
	}
	return nil, nil
}

func imageUrlsToImages(urls []string, tmpDir string) ([]ImageInfo, error) {
	images := []ImageInfo{}
	for _, url := range urls {
		if info, err := GetImageInfo(url, tmpDir); err != nil {
			for _, image := range images {
				os.Remove(image.LocalTempFilePath)
			}
			return nil, err
		} else {
			images = append(images, *info)
		}
	}
	return images, nil
}

func isImageType(mimeType string) bool {
	return mimeType == "image/jpeg" ||
		mimeType == "image/png" ||
		mimeType == "image/gif" ||
		mimeType == "image/svg" ||
		mimeType == "image/tiff"
}

func isVideoType(mimeType string) bool {
	return mimeType == "video/mp4" ||
		mimeType == "video/x-m4v" ||
		mimeType == "video/x-matroska" ||
		mimeType == "video/webm" ||
		mimeType == "video/quicktime" ||
		mimeType == "video/x-msvideo" ||
		mimeType == "video/x-ms-wmv" ||
		mimeType == "video/mpeg" ||
		mimeType == "video/x-flv"
}

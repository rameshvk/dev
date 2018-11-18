package linkinfo

import (
	"os"
	"reflect"
	"testing"
)

func testLink(url string, expected interface{}, t *testing.T) {
	if info, err := GetInfo(url, ""); err != nil {
		t.Error("Errored out", err)
	} else {
		if info != nil && info.Images != nil {
			for i, _ := range info.Images {
				os.Remove(info.Images[i].LocalTempFilePath)
				info.Images[i].LocalTempFilePath = ""
			}
		}
		if info == nil || !reflect.DeepEqual(*info, expected) {
			t.Errorf("Expected %#v but got %#v", expected, info)
		}
	}
}

const ytUrl = "https://www.youtube.com/watch?v=NkHg6cxrRSc"
const cloudlyUrl = "https://cl.ly/2o0x0s13462p"
const linkedinUrl = "https://www.linkedin.com/in/reidhoffman"

func TestInfo(t *testing.T) {
	testCases := map[string]Info{}
	testCaseNames := map[string]string{}

	testCaseNames["UsaToday"] = usaTodayUrl
	testCaseNames["Youtube"] = ytUrl
	testCaseNames["Cloudly"] = cloudlyUrl
	testCaseNames["Linkedin"] = linkedinUrl

	testCases[usaTodayUrl] = Info{
		CanonicalUrl: usaTodayUrl,
		Title:        "How Trump can stop North Korea's nuclear threats against the U.S.",
		Description:  "North Korea’s leader said he's developing a nuclear weapon to reach the United States.",
		SiteName:     "USA TODAY",
		Images: []ImageInfo{
			ImageInfo{
				ImageUrl: "http://www.gannett-cdn.com/-mm-/9a0629bb9384864ef713eb243b19b9c340befc47/c=0-278-5472-3370&r=x1683&c=3200x1680/local/-/media/2017/01/03/USATODAY/USATODAY/636190578948321301-AP-Emirates-Trump-Dubai.jpg",
				MimeType: "image/jpeg",
				Width:    3200,
				Height:   1680,
			},
			ImageInfo{
				ImageUrl: "http://www.gannett-cdn.com/GDContent/applogos/usatoday.png",
				MimeType: "image/png",
				Width:    512,
				Height:   512,
			},
		},
	}

	testCases[ytUrl] = Info{
		CanonicalUrl: ytUrl,
		Title:        "How to Learn to Paint a Girl Portrait in Gouache", Description: "How to Learn to Paint a Girl Portrait in Gouache",
		SiteName: "YouTube",
		Images: []ImageInfo{
			ImageInfo{ImageUrl: "https://i.ytimg.com/vi/NkHg6cxrRSc/hqdefault.jpg", MimeType: "image/jpeg", Width: 480, Height: 360},
		},
		Videos: []VideoInfo{
			VideoInfo{VideoUrl: "https://www.youtube.com/embed/NkHg6cxrRSc", MimeType: "text/html", Width: 1280, Height: 720},
		},
	}

	testCases[cloudlyUrl] = Info{
		CanonicalUrl: "https://cl.ly/2o0x0s13462p",
		Title:        "Image 2016-12-28 at 7.17.43 PM.png",
		SiteName:     "CloudApp",
		Images: []ImageInfo{
			ImageInfo{
				ImageUrl: "https://d3vv6lp55qjaqc.cloudfront.net/items/3T0B2O3A2B0E3m2p3m3v/Image%202016-12-28%20at%207.17.43%20PM.png",
				MimeType: "image/png",
				Width:    588,
				Height:   606,
			},
		},
	}

	testCases[linkedinUrl] = Info{
		CanonicalUrl: "https://www.linkedin.com/in/reidhoffman/de",
		Title:        "Reid Hoffman | LinkedIn",
		Description:  "View Reid Hoffman’s professional profile on LinkedIn. LinkedIn is the world's largest business network, helping professionals like Reid Hoffman discover inside connections to recommended job candidates, industry experts, and business partners.",
		SiteName:     "LINKEDIN",
		Images: []ImageInfo{
			ImageInfo{
				ImageUrl: "https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/5/000/1bd/26f/349c10e.jpg",
				MimeType: "image/jpeg",
				Width:    200,
				Height:   200,
			},
		},
	}

	for name, url := range testCaseNames {
		t.Run(name, func(t *testing.T) {
			testLink(url, testCases[url], t)
		})
	}
}

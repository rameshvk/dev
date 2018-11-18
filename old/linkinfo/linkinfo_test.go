package linkinfo

import (
	"io/ioutil"
	"strings"
	"testing"
)

const usaTodayUrl = "http://www.usatoday.com/story/news/world/2017/01/03/donald-trump-north-korea-nuclear-options/96121898/"

func TestLinkInfo(t *testing.T) {
	if htmlData, err := ioutil.ReadFile("./examples/usa_today.html"); err != nil {
		t.Error("Expected file", "./examples/usa_today.html")
	} else {
		rawUrl := usaTodayUrl
		linkInfo, _ := ParseLinkInfo(htmlData, rawUrl)

		expect := func(key, actual, expected string) {
			if actual != expected {
				t.Error("Mismatched", key, "Actual:", actual, "Expected", expected)
			}
		}
		expect("RawUrl", linkInfo.RawUrl, rawUrl)
		expect("CanonicalUrl", linkInfo.CanonicalUrl, rawUrl)
		expect("Title", linkInfo.Title, "How Trump can stop North Korea's nuclear threats against the U.S.")
		expect("Description", linkInfo.Description, "North Korea’s leader said he's developing a nuclear weapon to reach the United States.")
		expect("SiteName", linkInfo.SiteName, "USA TODAY")
		expect(
			"ImageUrls",
			strings.Join(linkInfo.ImageUrls, ","),
			strings.Join(
				[]string{
					"http://www.gannett-cdn.com/-mm-/9a0629bb9384864ef713eb243b19b9c340befc47/c=0-278-5472-3370&r=x1683&c=3200x1680/local/-/media/2017/01/03/USATODAY/USATODAY/636190578948321301-AP-Emirates-Trump-Dubai.jpg",
					"http://www.gannett-cdn.com/GDContent/applogos/usatoday.png",
				},
				",",
			),
		)
	}
}

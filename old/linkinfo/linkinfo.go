package linkinfo

import (
	"bytes"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"log"
	"net/url"
	"strconv"
	"strings"
)

type LinkInfo struct {
	RawUrl       string
	CanonicalUrl string
	Title        string
	Description  string
	SiteName     string
	ImageUrls    []string
	Videos       []VideoInfo
}

func ParseLinkInfo(htmlData []byte, rawUrl string) (*LinkInfo, error) {
	ll := &LinkInfo{RawUrl: rawUrl}
	meta := map[string]string{}

	if doc, err := html.Parse(bytes.NewReader(htmlData)); err != nil {
		return nil, err
	} else {
		traverse(doc, func(n *html.Node) {
			handleTitleTag(n, meta)
			handleLinkTag(n, meta)
			handleMetaTag(n, meta)
		})
	}

	ll.RawUrl = rawUrl
	ll.CanonicalUrl = rawUrl
	if meta["og:url"] != "" {
		ll.CanonicalUrl = meta["og:url"]
	} else if meta["rel-canonical"] != "" {
		ll.CanonicalUrl = meta["rel-canonical"]
	}

	ll.SiteName = getSiteName(ll.CanonicalUrl)
	if meta["og:site_name"] != "" {
		ll.SiteName = meta["og:site_name"]
	}
	ll.Title = meta["og:title"]
	if ll.Title == "" {
		ll.Title = meta["title"]
	}
	ll.Description = meta["og:description"]
	if ll.Description == "" {
		ll.Description = meta["description"]
	}
	if meta["og:image"] != "" {
		ll.ImageUrls = []string{meta["og:image"]}
		for n := 2; meta["og:image"+strconv.Itoa(n)] != ""; n++ {
			ll.ImageUrls = append(ll.ImageUrls, meta["og:image"+strconv.Itoa(n)])
		}
	}
	if meta["og:image:url"] != "" {
		ll.ImageUrls = append(ll.ImageUrls, meta["og:image:url"])
		for n := 2; meta["og:image:url"+strconv.Itoa(n)] != ""; n++ {
			ll.ImageUrls = append(ll.ImageUrls, meta["og:image:url"+strconv.Itoa(n)])
		}
	}

	if meta["og:video:url"] != "" {
		ll.Videos = []VideoInfo{VideoInfo{VideoUrl: meta["og:video:url"]}}
		if meta["og:video:width"] != "" {
			ll.Videos[0].Width, _ = strconv.Atoi(meta["og:video:width"])
		}
		if meta["og:video:height"] != "" {
			ll.Videos[0].Height, _ = strconv.Atoi(meta["og:video:height"])
		}
		if meta["og:video:type"] != "" {
			ll.Videos[0].MimeType = strings.ToLower(meta["og:video:type"])
		}
	}
	return ll, nil
}

func traverse(n *html.Node, f func(n *html.Node)) {
	f(n)

	for node := n.FirstChild; node != nil; node = node.NextSibling {
		traverse(node, f)
	}
}

func handleTitleTag(n *html.Node, meta map[string]string) {
	if n.Type == html.ElementNode && n.DataAtom == atom.Title {
		child := n.FirstChild
		if child != nil && child.Type == html.TextNode {
			meta["title"] = child.Data
		}
	}
}

func handleLinkTag(n *html.Node, meta map[string]string) {
	if n.Type == html.ElementNode && n.DataAtom == atom.Link {
		rel := ""
		href := ""
		for _, attr := range n.Attr {
			key := strings.ToLower(attr.Key)
			if key == "rel" {
				rel = strings.ToLower(attr.Val)
			}
			if key == "href" {
				href = attr.Val
			}
		}
		if rel != "" {
			meta["rel-canonical"] = href
		}
	}
}

func handleMetaTag(n *html.Node, meta map[string]string) {
	if n.Type == html.ElementNode && n.DataAtom == atom.Meta {
		property := ""
		content := ""

		for _, attr := range n.Attr {
			key := strings.ToLower(attr.Key)
			if key == "property" || key == "name" {
				property = strings.ToLower(attr.Val)
			}
			if key == "content" {
				content = attr.Val
			}
		}
		if property != "" {
			if meta[property] != "" {
				i := 1
				for i++; meta[property+strconv.Itoa(i)] != ""; i++ {
				}
				property = property + strconv.Itoa(i)
			}
			meta[property] = content
		}
	}

}

func getSiteName(rawUrl string) string {
	// calculate site name
	if parsedUrl, err := url.Parse(rawUrl); err != nil {
		log.Print("Unexpected error parsing Url", rawUrl, err)
		return "Unknown"
	} else {
		main := strings.ToUpper(strings.Split(parsedUrl.Host, ":")[0])
		return strings.TrimSuffix(strings.TrimPrefix(main, "WWW."), ".COM")
	}
}

# side-document

Display the document in a drawer using an iframe.

[https://try0.github.io/side-document/](https://try0.github.io/side-document/)

## Main Features

* Display any web page in a drawer using an iframe.
* Open the page displayed in the drawer in a new tab.
* Show the URL of the page displayed in the drawer as a QR code.
* The drawer can be resized.
* The drawer’s position can be changed.

## Usage

```html
<script src="https://unpkg.com/@try0/side-document@latest/dist/side-document.umd.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", async () => {
        const sd = await SideDocument.initialize({
            persistState: true,
            defaultSrc: "./sample.html",
        });
        sd.openDrawer("https://example.com/");
    });
</script>
```

## LICENSE

MIT

QR Code is a registered trademark of DENSO WAVE INCORPORATED.

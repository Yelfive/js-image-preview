# js-image-preview
Js base image preview tools

This is currently based on CSS3 and pure JavaScript

The selector is similar to jQuery,
however it uses the `document.querySelectorAll`,
and jQuery methods such as `$(selector).not(another)` is not available,
cause there is not such method called `not` on `fk`

# Usage
```js
fk('img').imagePreview();
// OR
fk('img').imagePreview({
  'animationTime': 300
});
```

## Options
- `animationTime: 300`: To specify how many microseconds to render the preview
- `previewOccupies: 0.9`: The percentage of the max occupation to the document.body,
    `1` means it is allowed to cover all the document.body

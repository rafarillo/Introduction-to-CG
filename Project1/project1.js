// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    console.log(fgPos);
    let startPixelPos = fgPos.x*4; 
    for(let i = 0; i < bgImg.data.length; i+=4, startPixelPos += 4)
    {
        if(i > fgImg.data.length) return;
        if(startPixelPos > fgImg.data.length) return;
        if(startPixelPos < 0) continue;

        const fgAlpha = fgOpac * fgImg.data[startPixelPos+3]/255;
        const bgAlpha = bgImg.data[i+3] / 255;
        const alpha = fgAlpha + (1 - fgAlpha) * bgAlpha;

        bgImg.data[i] = (fgAlpha * fgImg.data[startPixelPos] + (1 - fgAlpha) * bgAlpha * bgImg.data[i])/alpha;
        bgImg.data[i+1] = (fgAlpha * fgImg.data[startPixelPos+1] + (1 - fgAlpha) * bgAlpha * bgImg.data[i+1])/alpha;
        bgImg.data[i+2] = (fgAlpha * fgImg.data[startPixelPos+2] + (1 - fgAlpha) * bgAlpha * bgImg.data[i+2])/alpha;

        // const alpha = fgOpac + (1.0 - fgOpac) * 1.0;
        // bgImg.data[i] = (fgOpac * fgImg.data[i] + (1 - fgOpac) * 1.0 * bgImg.data[i])/alpha;
        // bgImg.data[i+1] = (fgOpac * fgImg.data[i+1] + (1 - fgOpac) * 1.0 * bgImg.data[i+1])/alpha;
        // bgImg.data[i+2] = (fgOpac * fgImg.data[i+2] + (1 - fgOpac) * 1.0 * bgImg.data[i+2])/alpha;
    }
}

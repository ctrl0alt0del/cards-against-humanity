export function performAssHack() {
    let colors = ['#FF0018', '#FFA52C', '#FFFF41', '#008018', '#0000F9', '#86007D'];
    const appEl = document.getElementById('react-target');
    appEl.style.transition = 'all 1s linear';
    setTimeout(() => {
        navigator.vibrate(300);
        appEl.style.background = `linear-gradient(${colors.reduce((t, c, i) => t.concat(`${c} ${i * 100/6}%, ${c} ${(i+1)*100/6}%`), []).join(', ')})`;
        appEl.style.filter = 'contrast(1.5)'
    }, 4300);
    const assHackedAudio1 = new Audio('/ass-hacked.mp3');
    assHackedAudio1.play();

}
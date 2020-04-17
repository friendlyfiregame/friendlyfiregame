import { bar } from "./foo";

const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas")!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
const img = new Image();
img.onload = () => {
    ctx.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "white";
    const metrics = ctx.measureText("Game not found");
    ctx.fillText("Game not found", (canvas.width - metrics.width) / 2, canvas.height / 2 + img.height);
};
img.src = "assets/images/cross.png";

bar();

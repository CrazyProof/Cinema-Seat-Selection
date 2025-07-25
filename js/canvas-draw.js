// 画布绘制功能模块
class CanvasDraw {
    constructor(cinemaSeating) {
        this.cinema = cinemaSeating;
        this.canvas = cinemaSeating.canvas;
        this.ctx = cinemaSeating.ctx;
    }

    // 计算座位在弧形布局中的坐标
    calculateSeatPosition(row, seat) {
        // 计算该排座位的弧形半径，从最后一排开始递减
        const rowRadius = this.cinema.arcRadius - (this.cinema.rows - row) * (this.cinema.seatRadius * 2 + this.cinema.rowSpacing);

        // 计算座位在该排中的角度范围
        const maxAngle = Math.PI / 4; // 60度的弧形范围
        const startAngle = -maxAngle / 2;
        const endAngle = maxAngle / 2;
        const angleStep = (endAngle - startAngle) / (this.cinema.seatsPerRow - 1);
        const seatAngle = startAngle + (seat - 1) * angleStep;

        // 计算座位的实际坐标
        const x = this.cinema.arcCenterX + rowRadius * Math.sin(seatAngle);
        const y = this.cinema.arcCenterY - rowRadius * Math.cos(seatAngle);

        return { x, y, angle: seatAngle };
    }

    // 绘制所有座位
    drawSeats() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.cinema.canvasWidth, this.cinema.canvasHeight);

        // 绘制每个座位
        for (let row = 1; row <= this.cinema.rows; row++) {
            for (let seat = 1; seat <= this.cinema.seatsPerRow; seat++) {
                this.drawSeat(row, seat);
            }
        }

        // 绘制排号
        this.drawRowNumbers();
    }

    // 绘制单个座位
    drawSeat(row, seat) {
        const seatId = `${row}-${seat}`;
        const position = this.calculateSeatPosition(row, seat);
        const state = this.cinema.seatStates[seatId];
        const isSelected = this.cinema.selectedSeats.has(seatId);

        // 保存当前状态
        this.ctx.save();

        // 移动到座位位置
        this.ctx.translate(position.x, position.y);

        // 设置座位颜色
        let fillColor, strokeColor;
        if (state === 'occupied') {
        fillColor = '#dc3545'; // 红色 - 已售
        strokeColor = '#a71e2a';
        } else if (state === 'reserved') {
        fillColor = '#ffc107'; // 黄色 - 已预订
        strokeColor = '#d39e00';
        } else if (isSelected) {
        fillColor = '#ffc107'; // 黄色 - 已选
        strokeColor = '#d39e00';
        } else {
        fillColor = '#28a745'; // 绿色 - 空座
        strokeColor = '#1e7e34';
        }

        // 绘制圆形座位
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.cinema.seatRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制座位号
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(seat.toString(), 0, 0);

        // 恢复状态
        this.ctx.restore();
    }

    // 绘制排号
    drawRowNumbers() {
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let row = 1; row <= this.cinema.rows; row++) {
            // 在每排左侧绘制排号
            const leftPosition = this.calculateSeatPosition(row, 1);
            const rightPosition = this.calculateSeatPosition(row, this.cinema.seatsPerRow);

            // 左侧排号
            const leftX = leftPosition.x - 50;
            const leftY = leftPosition.y;
            this.ctx.fillText(`第${row}排`, leftX, leftY);

            // 右侧排号
            const rightX = rightPosition.x + 50;
            const rightY = rightPosition.y;
            this.ctx.fillText(`第${row}排`, rightX, rightY);
        }
    }
}

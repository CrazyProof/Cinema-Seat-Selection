// 电影院选座系统主控制器

class CinemaSeating {
    constructor() {
        this.canvas = document.getElementById('seatCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 座位配置
        this.rows = 10;
        this.seatsPerRow = 20;
        this.totalSeats = this.rows * this.seatsPerRow;

        // 座位尺寸和间距 - 修改为圆形座位的半径
        this.seatRadius = 15; // 圆形座位半径
        this.seatSpacing = 10;
        this.rowSpacing = 15;

        // Canvas尺寸
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        // 弧形参数
        this.arcRadius = 1100; // 弧形半径
        this.arcCenterX = this.canvasWidth / 2;
        this.arcCenterY = this.canvasHeight + 570; // 弧心在canvas底部附近

        // 座位状态
        this.seatStates = this.initializeSeatStates();
        this.selectedSeats = new Set();

        // 票价
        this.ticketPrice = 45;

        // 初始化各功能模块
        this.canvasDraw = new CanvasDraw(this);
        this.seatSelect = new SeatSelect(this);
        this.ticketManager = new TicketManager(this);
        this.configUI = new ConfigUI(this);

        this.init();
    }

    // 初始化座位状态
    initializeSeatStates() {
        const states = {};
        for (let row = 1; row <= this.rows; row++) {
            for (let seat = 1; seat <= this.seatsPerRow; seat++) {
                const seatId = `${row}-${seat}`;
                // 所有座位默认为可用状态
                states[seatId] = 'available';
            }
        }
        return states;
    }

    // 初始化
    init() {
        this.canvasDraw.drawSeats();
    }

}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const cinema = new CinemaSeating();
});

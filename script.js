// 电影院选座系统主控制器

class CinemaSeating {
    constructor() {
        this.canvas = document.getElementById('seatCanvas');
        if (!this.canvas) {
            console.error('找不到Canvas元素 seatCanvas');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('无法获取Canvas 2D上下文');
            return;
        }        // 座位配置
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
        this.arcRadius = 900; // 弧形半径
        this.arcCenterX = this.canvasWidth / 2;
        this.arcCenterY = this.canvasHeight + 300; // 弧心在canvas底部附近

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
        this.updateSelectedSeatsDisplay();
    }    // 更新已选座位显示和价格
    updateSelectedSeatsDisplay() {
        const selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
        const totalPriceDisplay = document.getElementById('totalPrice');

        if (this.selectedSeats.size === 0) {
            selectedSeatsDisplay.textContent = '无';
            totalPriceDisplay.textContent = '¥0';
        } else {
            const seatsList = Array.from(this.selectedSeats)
                .sort((a, b) => {
                    const [rowA, seatA] = a.split('-').map(Number);
                    const [rowB, seatB] = b.split('-').map(Number);
                    return rowA !== rowB ? rowA - rowB : seatA - seatB;
                })
                .map(seatId => {
                    const [row, seat] = seatId.split('-');
                    return `第${row}排${seat}座`;
                })
                .join(', ');

            selectedSeatsDisplay.textContent = seatsList;
            totalPriceDisplay.textContent = `¥${this.selectedSeats.size * this.ticketPrice}`;
        }
    }

    // 配置放映厅大小
    configureTheater(size) {
        switch (size) {
            case 100:
                this.rows = 5;
                this.seatsPerRow = 20;
                // 调整弧形参数以适应5排座位
                this.arcRadius = 600;
                this.arcCenterY = this.canvasHeight + 200;
                this.rowSpacing = 15; // 正常行间距
                break;
            case 200:
                this.rows = 10;
                this.seatsPerRow = 20;
                // 默认的弧形参数
                this.arcRadius = 900;
                this.arcCenterY = this.canvasHeight + 300;
                this.rowSpacing = 15; // 正常行间距
                break;
            case 300:
                this.rows = 15;
                this.seatsPerRow = 20;
                // 调整弧形参数以适应15排座位
                this.arcRadius = 1000; // 稍微减小弧形半径
                this.arcCenterY = this.canvasHeight + 350; // 调整弧心位置
                this.rowSpacing = 8; // 缩小行间距以容纳更多排
                break;
            default:
                console.warn('不支持的放映厅大小:', size);
                return;
        }

        this.totalSeats = this.rows * this.seatsPerRow;
        this.seatStates = this.initializeSeatStates();
        this.selectedSeats.clear();

        // 重新绘制
        this.canvasDraw.drawSeats();
        this.updateSelectedSeatsDisplay();

        // 清除localStorage中的旧数据
        localStorage.removeItem('occupiedSeats');
        localStorage.removeItem('cinemaReservations');
    }

}

// 页面加载完成后初始化
let cinemaInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    cinemaInstance = new CinemaSeating();
});// 全局函数供其他模块调用
function updateSelectedSeatsDisplay() {
    if (cinemaInstance) {
        cinemaInstance.updateSelectedSeatsDisplay();
    }
}

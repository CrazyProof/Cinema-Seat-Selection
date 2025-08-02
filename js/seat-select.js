// 座位选择功能模块
class SeatSelect {
    constructor(cinema) {
        this.cinema = cinema;
        this.canvas = cinema.canvas;
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        // 自动选座按钮绑定
        const autoSelectBtn = document.getElementById('autoSelectBtn');
        if (autoSelectBtn) autoSelectBtn.addEventListener('click', this.autoSelectIndividual.bind(this));
        const autoSelectGroupBtn = document.getElementById('autoSelectGroupBtn');
        if (autoSelectGroupBtn) autoSelectGroupBtn.addEventListener('click', this.autoSelectGroup.bind(this));
        // 用于多次自动选座时换方案
        this.lastAutoSelected = [];
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let clickedSeat = null;
        // 遍历所有座位，判断是否被点击
        for (let row = 1; row <= this.cinema.rows; row++) {
            for (let seat = 1; seat <= this.cinema.seatsPerRow; seat++) {
                const pos = this.cinema.canvasDraw.calculateSeatPosition(row, seat);
                const dx = x - pos.x;
                const dy = y - pos.y;
                if (Math.sqrt(dx * dx + dy * dy) <= this.cinema.seatRadius) {
                    const seatId = `${row}-${seat}`;
                    //if (this.cinema.seatStates[seatId] !== 'occupied') {
                    clickedSeat = seatId;
                    //}

                    break;
                }
            }
            if (clickedSeat) break;
        }
        if (!clickedSeat) return;
        if (event.ctrlKey) {
            // 多选：切换选中状态
            if (this.cinema.selectedSeats.has(clickedSeat)) {
                this.cinema.selectedSeats.delete(clickedSeat);
            } else {
                this.cinema.selectedSeats.add(clickedSeat);
            }
        } else {
            // 单选：只选当前座位
            this.cinema.selectedSeats.clear();
            this.cinema.selectedSeats.add(clickedSeat);
        }
        this.cinema.canvasDraw.drawSeats();
        // 可选：更新已选座位显示和价格
        if (typeof updateSelectedSeatsDisplay === 'function') {
            updateSelectedSeatsDisplay();
        }
    }

    autoSelectIndividual() {
        const age = parseInt(document.getElementById('customerAge').value, 10);
        if (isNaN(age)) {
            alert('请填写年龄');
            return;
        }
        // 规则：少年（<15）不能前3排，老年（>60）不能后3排
        let validRows = [];
        if (age < 15) {
            validRows = Array.from({ length: this.cinema.rows - 3 }, (_, i) => i + 4);
        } else if (age > 60) {
            validRows = Array.from({ length: this.cinema.rows - 3 }, (_, i) => i + 1);
        } else {
            validRows = Array.from({ length: this.cinema.rows }, (_, i) => i + 1);
        }

        // 查找可选座位并按距离中心的距离排序
        const candidates = [];
        const centerSeat = Math.ceil(this.cinema.seatsPerRow / 2); // 中心座位号

        for (let row of validRows) {
            for (let seat = 1; seat <= this.cinema.seatsPerRow; seat++) {
                const seatId = `${row}-${seat}`;
                if (this.cinema.seatStates[seatId] === 'available' && !this.cinema.selectedSeats.has(seatId)) {
                    // 计算座位到中心的距离
                    const distanceFromCenter = Math.abs(seat - centerSeat);
                    candidates.push({ seatId, distanceFromCenter, row, seat });
                }
            }
        }

        // 按优先级排序：1.距离中心近的 2.排数中等的 3.避免上次选择的
        candidates.sort((a, b) => {
            // 如果距离中心不同，优先选择距离中心近的
            if (a.distanceFromCenter !== b.distanceFromCenter) {
                return a.distanceFromCenter - b.distanceFromCenter;
            }
            // 距离中心相同时，优先选择中间排次
            const centerRow = Math.ceil(this.cinema.rows / 2);
            const aRowDistance = Math.abs(a.row - centerRow);
            const bRowDistance = Math.abs(b.row - centerRow);
            return aRowDistance - bRowDistance;
        });

        // 多次自动选座时换方案
        let pick = null;
        for (let candidate of candidates) {
            if (!this.lastAutoSelected.includes(candidate.seatId)) {
                pick = candidate.seatId;
                break;
            }
        }
        if (!pick && candidates.length > 0) {
            pick = candidates[0].seatId; // 没有新方案就用第一个（最佳位置）
        }
        if (pick) {
            this.cinema.selectedSeats.clear();
            this.cinema.selectedSeats.add(pick);
            this.lastAutoSelected = [pick];
            this.cinema.canvasDraw.drawSeats();
            if (typeof updateSelectedSeatsDisplay === 'function') updateSelectedSeatsDisplay();
        } else {
            alert('没有可用座位，请手动选座');
        }
    }

    autoSelectGroup() {
        const groupSize = parseInt(document.getElementById('groupSize').value, 10);
        const groupMembersDiv = document.getElementById('groupMembers');
        const memberDivs = groupMembersDiv.querySelectorAll('.group-member');
        if (isNaN(groupSize) || groupSize < 1 || groupSize > 20 || memberDivs.length !== groupSize) {
            alert('请填写完整的团体信息');
            return;
        }
        // 获取所有成员年龄
        const ages = [];
        for (let i = 0; i < groupSize; i++) {
            const ageInput = memberDivs[i].querySelector(`input[name="memberAge${i + 1}"]`);
            const age = parseInt(ageInput.value, 10);
            if (isNaN(age)) {
                alert('请填写所有成员的年龄');
                return;
            }
            ages.push(age);
        }
        // 规则：少年（<15）不能前3排，老年（>60）不能后3排，成年人随意
        let validRows = [];
        for (let row = 1; row <= this.cinema.rows; row++) {
            let valid = true;
            for (let age of ages) {
                if (age < 15 && row <= 3) valid = false;
                if (age > 60 && row > this.cinema.rows - 3) valid = false;
            }
            if (valid) validRows.push(row);
        }
        // 查找同排连续可用座位块，优先选择中间位置
        let found = false;
        let selectedBlock = [];
        let lastBlock = this.lastAutoSelected;
        let bestScore = Infinity;

        for (let row of validRows) {
            for (let start = 1; start <= this.cinema.seatsPerRow - groupSize + 1; start++) {
                let block = [];
                let allAvailable = true;
                for (let offset = 0; offset < groupSize; offset++) {
                    const seatId = `${row}-${start + offset}`;
                    if (this.cinema.seatStates[seatId] !== 'available' || (lastBlock && lastBlock.includes(seatId))) {
                        allAvailable = false;
                        break;
                    }
                    block.push(seatId);
                }

                if (allAvailable) {
                    // 计算这个座位块的"中心性"得分（越小越好）
                    const blockCenter = start + (groupSize - 1) / 2; // 座位块的中心位置
                    const seatRowCenter = this.cinema.seatsPerRow / 2; // 排的中心位置
                    const rowCenter = this.cinema.rows / 2; // 影院行的中心

                    // 综合得分：距离座位中心的距离 + 距离排中心的距离（权重较小）
                    const seatCenterDistance = Math.abs(blockCenter - seatRowCenter);
                    const rowCenterDistance = Math.abs(row - rowCenter) * 0.3; // 排的中心性权重较小
                    const score = seatCenterDistance + rowCenterDistance;

                    if (score < bestScore) {
                        bestScore = score;
                        selectedBlock = block;
                        found = true;
                    }
                }
            }
        }
        // 如果没有新方案，允许重复上次方案
        if (!found && lastBlock && lastBlock.length === groupSize) {
            let stillAvailable = true;
            for (let seatId of lastBlock) {
                if (this.cinema.seatStates[seatId] !== 'available') stillAvailable = false;
            }
            if (stillAvailable) {
                selectedBlock = lastBlock;
                found = true;
            }
        }
        if (found && selectedBlock.length === groupSize) {
            this.cinema.selectedSeats.clear();
            selectedBlock.forEach(seatId => this.cinema.selectedSeats.add(seatId));
            this.lastAutoSelected = selectedBlock;
            this.cinema.canvasDraw.drawSeats();
            if (typeof updateSelectedSeatsDisplay === 'function') updateSelectedSeatsDisplay();
        } else {
            alert('没有可用座位，请手动选座');
        }
    }
}

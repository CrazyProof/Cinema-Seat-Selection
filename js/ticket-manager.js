// 票务管理功能模块
class TicketManager {
    constructor(cinema) {
        this.cinema = cinema;
        this.initEventHandlers();
        this.restoreReservations();
    }

    initEventHandlers() {
        const reserveBtn = document.getElementById('reserveBtn');
        const buyBtn = document.getElementById('buyBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const refundBtn = document.getElementById('refundBtn');

        if (reserveBtn) reserveBtn.addEventListener('click', () => this.reserveSeats());
        if (buyBtn) buyBtn.addEventListener('click', () => this.directPurchase());
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmPurchase());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelReservation());
        if (refundBtn) refundBtn.addEventListener('click', () => this.refundTickets());
    }

    // 预订座位（标记为"预订"状态）
    reserveSeats() {
        if (this.cinema.selectedSeats.size === 0) {
            alert('请先选择座位');
            return;
        }

        // 检查所选座位是否可用
        for (let seatId of this.cinema.selectedSeats) {
            if (this.cinema.seatStates[seatId] !== 'available') {
                alert('所选座位中包含不可用座位，请重新选择');
                return;
            }
        }

        // 验证顾客信息
        if (!this.validateCustomerInfo()) {
            return;
        }

        this.cinema.selectedSeats.forEach(id => {
            this.cinema.seatStates[id] = 'reserved';
        });

        // 保存预订信息
        this.saveReservationInfo();

        this.redrawAndPersist();
        alert('座位预订成功！');
    }

    // 直接购买（无需预订）
    directPurchase() {
        if (this.cinema.selectedSeats.size === 0) {
            alert('请先选择座位');
            return;
        }

        // 检查所选座位是否可用
        for (let seatId of this.cinema.selectedSeats) {
            if (this.cinema.seatStates[seatId] !== 'available') {
                alert('所选座位中包含不可用座位，请重新选择');
                return;
            }
        }

        // 验证顾客信息
        if (!this.validateCustomerInfo()) {
            return;
        }

        // 直接标记为已售
        this.cinema.selectedSeats.forEach(id => {
            this.cinema.seatStates[id] = 'occupied';
        });

        // 保存购票信息
        this.savePurchaseInfo();

        // 计算总价（在清空选择之前）
        const totalPrice = this.cinema.selectedSeats.size * this.cinema.ticketPrice;

        this.redrawAndPersist();

        alert(`购票成功！总价：¥${totalPrice}`);
    }

    // 确认购买（将预订的座位转为已售）
    confirmPurchase() {
        if (this.cinema.selectedSeats.size === 0) {
            alert('请先选择要确认购买的预订座位');
            return;
        }

        let confirmedCount = 0;
        let totalPrice = 0;

        this.cinema.selectedSeats.forEach(id => {
            if (this.cinema.seatStates[id] === 'reserved') {
                this.cinema.seatStates[id] = 'occupied';
                confirmedCount++;
                totalPrice += this.cinema.ticketPrice;
            }
        });

        if (confirmedCount > 0) {
            // 更新预订记录状态为已购买
            this.updateReservationStatus();
            this.redrawAndPersist();
            alert(`确认购买成功！共${confirmedCount}张票，总价：¥${totalPrice}`);
        } else {
            alert('选择的座位中没有预订状态的座位');
        }
    }

    // 取消预订
    cancelReservation() {
        if (this.cinema.selectedSeats.size === 0) {
            alert('请先选择要取消的座位');
            return;
        }

        this.cinema.selectedSeats.forEach(id => {
            if (this.cinema.seatStates[id] === 'reserved') {
                this.cinema.seatStates[id] = 'available';
            }
        });
        this.redrawAndPersist();
        alert('预订已取消');
    }

    // 退票
    refundTickets() {
        if (this.cinema.selectedSeats.size === 0) {
            alert('请先选择要退票的座位');
            return;
        }

        let refundCount = 0;
        this.cinema.selectedSeats.forEach(id => {
            if (this.cinema.seatStates[id] === 'occupied') {
                this.cinema.seatStates[id] = 'available';
                refundCount++;
            }
        });

        if (refundCount > 0) {
            const refundAmount = refundCount * this.cinema.ticketPrice;
            this.redrawAndPersist();
            alert(`退票成功！退款金额：¥${refundAmount}`);
        } else {
            alert('选择的座位中没有已售出的票');
        }
    }

    // 验证顾客信息
    validateCustomerInfo() {
        const ticketType = document.querySelector('input[name="ticketType"]:checked')?.value;

        if (ticketType === 'individual') {
            const name = document.getElementById('customerName')?.value.trim();
            const age = document.getElementById('customerAge')?.value.trim();

            if (!name || !age) {
                alert('请填写完整的个人信息（姓名和年龄）');
                return false;
            }

            if (isNaN(age) || age < 1 || age > 120) {
                alert('请输入有效的年龄（1-120岁）');
                return false;
            }
        } else if (ticketType === 'group') {
            const groupSize = parseInt(document.getElementById('groupSize')?.value, 10);
            const groupMembersDiv = document.getElementById('groupMembers');
            const memberDivs = groupMembersDiv?.querySelectorAll('.group-member') || [];

            if (isNaN(groupSize) || groupSize < 1 || groupSize > 20) {
                alert('请输入有效的团体人数（1-20人）');
                return false;
            }

            if (memberDivs.length !== groupSize) {
                alert('请先点击"添加成员"并填写所有成员信息');
                return false;
            }

            if (this.cinema.selectedSeats.size !== groupSize) {
                alert(`请选择${groupSize}个座位`);
                return false;
            }

            // 验证每个成员信息
            for (let i = 0; i < groupSize; i++) {
                const nameInput = memberDivs[i].querySelector(`input[name="memberName${i + 1}"]`);
                const ageInput = memberDivs[i].querySelector(`input[name="memberAge${i + 1}"]`);

                if (!nameInput?.value.trim() || !ageInput?.value.trim()) {
                    alert(`请完整填写成员${i + 1}的信息`);
                    return false;
                }

                const age = parseInt(ageInput.value, 10);
                if (isNaN(age) || age < 1 || age > 120) {
                    alert(`成员${i + 1}的年龄无效，请输入1-120岁之间的数字`);
                    return false;
                }
            }
        } else {
            alert('请选择票务类型');
            return false;
        }

        return true;
    }

    // 保存预订信息
    saveReservationInfo() {
        const ticketType = document.querySelector('input[name="ticketType"]:checked').value;
        const selectedSeats = Array.from(this.cinema.selectedSeats);
        let reservationData = [];

        if (ticketType === 'individual') {
            const name = document.getElementById('customerName').value.trim();
            const age = parseInt(document.getElementById('customerAge').value, 10);

            reservationData.push({
                type: 'individual',
                name,
                age,
                seats: selectedSeats.slice(),
                status: 'reserved',
                timestamp: new Date().toISOString()
            });
        } else {
            const groupSize = parseInt(document.getElementById('groupSize').value, 10);
            const groupMembersDiv = document.getElementById('groupMembers');
            const memberDivs = groupMembersDiv.querySelectorAll('.group-member');

            let members = [];
            for (let i = 0; i < groupSize; i++) {
                const nameInput = memberDivs[i].querySelector(`input[name="memberName${i + 1}"]`);
                const ageInput = memberDivs[i].querySelector(`input[name="memberAge${i + 1}"]`);
                members.push({
                    name: nameInput.value.trim(),
                    age: parseInt(ageInput.value, 10),
                    seat: selectedSeats[i]
                });
            }

            reservationData.push({
                type: 'group',
                members,
                seats: selectedSeats.slice(),
                status: 'reserved',
                timestamp: new Date().toISOString()
            });
        }

        this.saveReservations(reservationData);
    }

    // 保存购票信息
    savePurchaseInfo() {
        const ticketType = document.querySelector('input[name="ticketType"]:checked').value;
        const selectedSeats = Array.from(this.cinema.selectedSeats);
        let purchaseData = [];

        if (ticketType === 'individual') {
            const name = document.getElementById('customerName').value.trim();
            const age = parseInt(document.getElementById('customerAge').value, 10);

            purchaseData.push({
                type: 'individual',
                name,
                age,
                seats: selectedSeats.slice(),
                status: 'purchased',
                price: selectedSeats.length * this.cinema.ticketPrice,
                timestamp: new Date().toISOString()
            });
        } else {
            const groupSize = parseInt(document.getElementById('groupSize').value, 10);
            const groupMembersDiv = document.getElementById('groupMembers');
            const memberDivs = groupMembersDiv.querySelectorAll('.group-member');

            let members = [];
            for (let i = 0; i < groupSize; i++) {
                const nameInput = memberDivs[i].querySelector(`input[name="memberName${i + 1}"]`);
                const ageInput = memberDivs[i].querySelector(`input[name="memberAge${i + 1}"]`);
                members.push({
                    name: nameInput.value.trim(),
                    age: parseInt(ageInput.value, 10),
                    seat: selectedSeats[i]
                });
            }

            purchaseData.push({
                type: 'group',
                members,
                seats: selectedSeats.slice(),
                status: 'purchased',
                price: selectedSeats.length * this.cinema.ticketPrice,
                timestamp: new Date().toISOString()
            });
        }

        this.saveReservations(purchaseData);
    }

    // 辅助方法：清除选择、重绘、持久化、更新显示
    redrawAndPersist() {
        this.cinema.selectedSeats.clear();
        this.cinema.canvasDraw.drawSeats();
        this.persistOccupiedSeats();
        if (typeof updateSelectedSeatsDisplay === 'function') {
            updateSelectedSeatsDisplay();
        }
    }

    // 持久化所有已售座位到localStorage
    persistOccupiedSeats() {
        const occupied = Object.keys(this.cinema.seatStates)
            .filter(id => this.cinema.seatStates[id] === 'occupied');
        localStorage.setItem('occupiedSeats', JSON.stringify(occupied));
    }

    // 保存预订/购票记录
    saveReservations(newData) {
        let all = [];
        try {
            all = JSON.parse(localStorage.getItem('cinemaReservations')) || [];
        } catch (e) {
            all = [];
        }
        all = all.concat(newData);
        localStorage.setItem('cinemaReservations', JSON.stringify(all));
    }

    // 恢复预订信息
    restoreReservations() {
        // 恢复已售座位
        let occupied = [];
        try {
            occupied = JSON.parse(localStorage.getItem('occupiedSeats')) || [];
        } catch (e) {
            occupied = [];
        }

        for (const id of occupied) {
            if (this.cinema.seatStates[id] !== undefined) {
                this.cinema.seatStates[id] = 'occupied';
            }
        }

        // 恢复预订座位
        try {
            const reservations = JSON.parse(localStorage.getItem('cinemaReservations')) || [];
            reservations.forEach(reservation => {
                if (reservation.status === 'reserved') {
                    reservation.seats.forEach(seatId => {
                        if (this.cinema.seatStates[seatId] !== undefined && this.cinema.seatStates[seatId] === 'available') {
                            this.cinema.seatStates[seatId] = 'reserved';
                        }
                    });
                }
            });
        } catch (e) {
            console.warn('恢复预订信息失败:', e);
        }

        if (this.cinema.canvasDraw) {
            this.cinema.canvasDraw.drawSeats();
        }

        if (typeof updateSelectedSeatsDisplay === 'function') {
            updateSelectedSeatsDisplay();
        }
    }

    // 更新预订记录状态为已购买
    updateReservationStatus() {
        try {
            const reservations = JSON.parse(localStorage.getItem('cinemaReservations')) || [];
            const selectedSeatsList = Array.from(this.cinema.selectedSeats);

            reservations.forEach(reservation => {
                // 检查是否有重叠的座位
                const hasOverlap = reservation.seats.some(seat => selectedSeatsList.includes(seat));
                if (hasOverlap && reservation.status === 'reserved') {
                    reservation.status = 'purchased';
                    reservation.purchaseTimestamp = new Date().toISOString();
                    reservation.price = reservation.seats.length * this.cinema.ticketPrice;
                }
            });

            localStorage.setItem('cinemaReservations', JSON.stringify(reservations));
        } catch (e) {
            console.warn('更新预订记录状态失败:', e);
        }
    }
}

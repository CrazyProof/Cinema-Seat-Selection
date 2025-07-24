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
        const cancelBtn = document.getElementById('cancelBtn');
        const refundBtn = document.getElementById('refundBtn');

        reserveBtn.addEventListener('click',() => this.reserveSeats());
        buyBtn.addEventListener('click',() => this.confirmPurchase());
        cancelBtn.addEventListener('click',() => this.cancelReservation());
        refundBtn.addEventListener('click',() => this.refundTickets());
    }

    //Reserve selected seats (mark as “reserved”)
    reserveSeats() {
        this.cinema.selectedSeats.forEach(id => 
            {this.cinema.seatStates[id] = 'reserved';});
        this.redrawAndPersist();
    }
    //Confirm purchase
    confirmPurchase() {
        Object.entries(this.cinema.seatStates).forEach(([id, state]) => {
            if (state === 'reserved') {
                this.cinema.seatStates[id] = 'occupied';
            }
        });
        this.redrawAndPersist();
    }
    //Cancel reservation
    cancelReservation() {
        this.cinema.selectedSeats.forEach(id => {
            if (this.cinema.seatStates[id] === 'reserved') {
                this.cinema.seatStates[id] = 'available';
            }
        });
        this.redrawAndPersist();
    }
    //Refund ticket
    refundTickets() {
        this.cinema.selectedSeats.forEach(id => {
            if (this.cinema.seatStates[id] === 'occupied') {
                this.cinema.seatStates[id] = 'available';
            }
        });
        this.redrawAndPersist();
    }
  
    //Helper to clear selection, redraw, persist, update display
    redrawAndPersist(){
        this.cinema.selectedSeats.clear();
        this.cinema.canvasDraw.drawSeats();
        this.persistOccupiedSeats();
        if(typeof updateSelectedSeatsDisplay === 'function'){
            updateSelectedSeatsDisplay();
        }
    }

    // Persist all occupied seats to localStorage
    persistOccupiedSeats() {
        const occupied = Object.keys(this.cinema.seatStates)
            .filter(id => this.cinema.seatStates[id] === 'occupied');
        localStorage.setItem('occupiedSeats', JSON.stringify(occupied));
    }

    handleSubmit() {
        // 判断票类型
        const ticketType = document.querySelector('input[name="ticketType"]:checked').value;
        const selectedSeats = Array.from(this.cinema.selectedSeats);
        let valid = true;
        let expectedCount = 1;
        let reservationData = [];
        if (ticketType === 'individual') {
            // 个人票校验
            const name = document.getElementById('customerName').value.trim();
            const age = document.getElementById('customerAge').value.trim();
            if (!name || !age) {
                alert('请填写完整的个人信息');
                valid = false;
            }
            expectedCount = 1;
            reservationData.push({
                type: 'individual',
                name,
                age: parseInt(age, 10),
                seats: selectedSeats.slice()
            });
        } else {
            // 团体票校验
            const groupSize = parseInt(document.getElementById('groupSize').value, 10);
            const groupMembersDiv = document.getElementById('groupMembers');
            const memberDivs = groupMembersDiv.querySelectorAll('.group-member');
            if (isNaN(groupSize) || groupSize < 1 || groupSize > 20) {
                alert('请输入有效的团体人数');
                valid = false;
            } else if (memberDivs.length !== groupSize) {
                alert('请先点击“添加成员”并填写所有成员信息');
                valid = false;
            } else {
                for (let i = 0; i < groupSize; i++) {
                    const nameInput = memberDivs[i].querySelector(`input[name="memberName${i + 1}"]`);
                    const ageInput = memberDivs[i].querySelector(`input[name="memberAge${i + 1}"]`);
                    if (!nameInput.value.trim() || !ageInput.value.trim()) {
                        alert(`请完整填写成员${i + 1}的信息`);
                        valid = false;
                        break;
                    }
                }
            }
            expectedCount = groupSize;
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
                members
            });
        }
        if (!valid) return;
        if (selectedSeats.length !== expectedCount) {
            alert(`请选择${expectedCount}个座位`);
            return;
        }
        // 设置座位为已售
        selectedSeats.forEach(seatId => {
            this.cinema.seatStates[seatId] = 'occupied';
        });
        this.cinema.selectedSeats.clear();
        this.cinema.canvasDraw.drawSeats();
        if (typeof updateSelectedSeatsDisplay === 'function') {
            updateSelectedSeatsDisplay();
        }
        alert('操作成功，座位已锁定！');
        // 保存到localStorage
        this.saveReservations(reservationData);
        return;
    }

    saveReservations(newData) {
        let all = [];
        try {
            all = JSON.parse(localStorage.getItem('cinemaReservations')) || [];
        } catch (e) { all = []; }
        all = all.concat(newData);
        localStorage.setItem('cinemaReservations', JSON.stringify(all));
    }

    restoreReservations() {
        let occupied = [];
        try {
            occupied = JSON.parse(localStorage.getItem('occupiedSeats')) || [];
        } catch (e) { occupied = []; }
        for (const id of occupied) {
            if (this.cinema.seatStates[id] !== undefined) {
                this.cinema.seatStates[id] = 'occupied';
            }
        }
        this.cinema.canvasDraw.drawSeats();
        if (typeof updateSelectedSeatsDisplay === 'function') updateSelectedSeatsDisplay();
    }
}

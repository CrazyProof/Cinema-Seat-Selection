// 配置和UI管理功能模块
class ConfigUI {
    constructor() {
        this.initTicketTypeToggle();
    }

    initTicketTypeToggle() {
        const individualInfo = document.getElementById('individualInfo');
        const groupInfo = document.getElementById('groupInfo');
        const ticketTypeRadios = document.getElementsByName('ticketType');

        function updateDisplay() {
            const selectedType = Array.from(ticketTypeRadios).find(r => r.checked)?.value;
            if (selectedType === 'group') {
                groupInfo.style.display = '';
                individualInfo.style.display = 'none';
            } else {
                groupInfo.style.display = 'none';
                individualInfo.style.display = '';
            }
        }

        ticketTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateDisplay);
        });
        // 初始化时设置一次
        updateDisplay();

        // 新增：团体成员添加逻辑
        const addMemberBtn = document.getElementById('addMemberBtn');
        const groupSizeInput = document.getElementById('groupSize');
        const groupMembersDiv = document.getElementById('groupMembers');

        addMemberBtn.addEventListener('click', function () {
            const size = parseInt(groupSizeInput.value, 10);
            const currentMembers = groupMembersDiv.querySelectorAll('.group-member');
            // 检查是否已有成员输入框
            if (currentMembers.length > 0) {
                // 检查成员数量是否与输入人数一致
                if (currentMembers.length !== size) {
                    alert('当前成员数与输入的人数不一致，请先填写完整或修改人数。');
                    return;
                }
                // 检查每个成员信息是否填写完整
                for (let i = 0; i < currentMembers.length; i++) {
                    const nameInput = currentMembers[i].querySelector(`input[name="memberName${i + 1}"]`);
                    const ageInput = currentMembers[i].querySelector(`input[name="memberAge${i + 1}"]`);
                    if (!nameInput.value.trim() || !ageInput.value.trim()) {
                        alert(`请完整填写成员${i + 1}的信息。`);
                        return;
                    }
                }
            }
            groupMembersDiv.innerHTML = '';
            if (isNaN(size) || size < 1 || size > 20) {
                groupMembersDiv.innerHTML = '<p style="color:red;">请输入1-20之间的人数</p>';
                return;
            }
            for (let i = 1; i <= size; i++) {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'group-member';
                memberDiv.style.marginBottom = '8px';
                memberDiv.innerHTML = `
                    <input type="text" name="memberName${i}" placeholder="成员${i}姓名" required style="margin-right:6px;">
                    <input type="number" name="memberAge${i}" placeholder="年龄" min="1" max="120" required style="margin-right:6px;">
                `;
                groupMembersDiv.appendChild(memberDiv);
            }
        });
    }
}

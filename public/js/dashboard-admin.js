// Admin Dashboard JS
document.addEventListener('DOMContentLoaded', async () => {
    if (!api.token) {
        window.location.href = '/index.html';
        return;
    }

    await loadAdminData();
    setupAdminListeners();
});

async function loadAdminData() {
    try {
        const stats = await api.getDashboardStats();
        updateDashboardStats(stats.stats);
        
        const adminUser = await api.getProfile();
        document.getElementById('admin-name').textContent = adminUser.user.name || 'المسؤول';
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('خطأ في تحميل البيانات', 'error');
    }
}

function updateDashboardStats(stats) {
    document.getElementById('total-users').textContent = stats.totalUsers || 0;
    document.getElementById('total-tasks').textContent = stats.totalTasks || 0;
    document.getElementById('pending-withdrawals').textContent = stats.pendingWithdrawals || 0;
    document.getElementById('total-distributed').textContent = formatCurrency(stats.totalEarningsDistributed || 0);
}

function setupAdminListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchAdminPage(page);
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    document.getElementById('create-task-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewTask();
    });

    document.querySelector('.logout-btn').addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            logout();
        }
    });
}

function switchAdminPage(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        
        if (page === 'users') {
            loadAdminUsers();
        } else if (page === 'withdrawals') {
            loadPendingWithdrawals();
        }
    }
}

async function loadAdminUsers() {
    try {
        const data = await api.getAllUsers();
        const table = document.getElementById('users-table');
        table.innerHTML = '';

        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.innerHTML = `
                    <span>${user.name}</span>
                    <span>${user.email}</span>
                    <span>${user.country}</span>
                    <span>${formatCurrency(user.balance)}</span>
                    <span class="status-${user.status}">${user.status === 'active' ? 'نشط' : 'معلق'}</span>
                    <div class="actions">
                        <button class="btn-small" onclick="editUser('${user._id}')">تحرير</button>
                        <button class="btn-small btn-danger" onclick="suspendUser('${user._id}')">إيقاف</button>
                    </div>
                `;
                table.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadPendingWithdrawals() {
    try {
        const data = await api.getAllWithdrawals();
        const table = document.getElementById('withdrawals-table');
        table.innerHTML = '';

        if (data.withdrawals && data.withdrawals.length > 0) {
            data.withdrawals.forEach(w => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.innerHTML = `
                    <span>${w.user?.name}</span>
                    <span>${formatCurrency(w.amount)}</span>
                    <span>${w.method}</span>
                    <span class="status-${w.status}">${w.status}</span>
                    <span>${formatDate(w.createdAt)}</span>
                    ${w.status === 'pending' ? `
                        <button class="btn-small btn-success" onclick="approveWithdrawalRequest('${w._id}')">موافقة</button>
                    ` : ''}
                `;
                table.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading withdrawals:', error);
    }
}

function showCreateTaskForm() {
    document.getElementById('task-form-container').style.display = 'block';
}

function closeTaskForm() {
    document.getElementById('task-form-container').style.display = 'none';
    document.getElementById('create-task-form').reset();
}

async function createNewTask() {
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        type: document.getElementById('task-type').value,
        reward: parseFloat(document.getElementById('task-reward').value),
        link: document.getElementById('task-link').value,
    };

    try {
        await api.createTask(taskData);
        showNotification('تم إنشاء المهمة بنجاح! ✅', 'success');
        closeTaskForm();
        loadAdminData();
    } catch (error) {
        showNotification('خطأ في إنشاء المهمة', 'error');
    }
}

async function approveWithdrawalRequest(withdrawalId) {
    if (confirm('هل تريد الموافقة على هذا الطلب؟')) {
        try {
            await api.approveWithdrawal(withdrawalId);
            showNotification('تم الموافقة على الطلب! ✅', 'success');
            loadPendingWithdrawals();
        } catch (error) {
            showNotification('خطأ في الموافقة', 'error');
        }
    }
}

function generateReport(reportType) {
    showNotification(`تم تحميل تقرير ${reportType}...`, 'success');
    // Implement actual report generation
}
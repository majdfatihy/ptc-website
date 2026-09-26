// Browser-safe API configuration. Set window.API_URL before loading this file in production.
const API_URL = window.API_URL || 'http://localhost:5000/api';

class APIClient {
    constructor(){this.token=localStorage.getItem('authToken')}
    setToken(token){this.token=token;localStorage.setItem('authToken',token)}
    getHeaders(){const headers={'Content-Type':'application/json'};if(this.token)headers.Authorization=`Bearer ${this.token}`;return headers}
    async request(endpoint,method='GET',data=null){const options={method,headers:this.getHeaders()};if(data&&method!=='GET')options.body=JSON.stringify(data);const response=await fetch(`${API_URL}${endpoint}`,options);const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||'Request failed');return result}
    register(name,email,password,country){return this.request('/auth/register','POST',{name,email,password,country})}
    login(email,password){return this.request('/auth/login','POST',{email,password})}
    getProfile(){return this.request('/users/profile')}
    updateProfile(data){return this.request('/users/profile','PUT',data)}
    getReferrals(){return this.request('/users/referrals')}
    getTasks(){return this.request('/tasks')}
    completeTask(id){return this.request(`/tasks/${id}/complete`,'POST')}
    createTask(data){return this.request('/tasks','POST',data)}
    getEarnings(){return this.request('/earnings')}
    requestWithdrawal(data){return this.request('/withdrawals','POST',data)}
    getWithdrawals(){return this.request('/withdrawals')}
    getDashboardStats(){return this.request('/admin/dashboard')}
    getAllUsers(){return this.request('/admin/users')}
    getAllWithdrawals(){return this.request('/admin/withdrawals')}
    approveWithdrawal(id){return this.request(`/admin/withdrawals/${id}/approve`,'PUT')}
}
const api=new APIClient();
function showNotification(message,type='success'){const n=document.createElement('div');n.textContent=message;n.style.cssText=`position:fixed;top:20px;right:20px;padding:14px 20px;border-radius:8px;color:#fff;background:${type==='error'?'#d64545':'#20a464'};z-index:9999`;document.body.appendChild(n);setTimeout(()=>n.remove(),3000)}
function formatCurrency(amount){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(amount)||0)}
function formatDate(date){return new Intl.DateTimeFormat('ar-EG').format(new Date(date))}
function logout(){localStorage.removeItem('authToken');window.location.href='/index.html'}
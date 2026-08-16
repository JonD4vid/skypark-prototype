import { createRouter, createWebHistory } from 'vue-router'
import CustomerLayout from '@/layouts/CustomerLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: CustomerLayout,
      children: [
        { path: '', name: 'entry', component: () => import('@/views/customer/EntryView.vue') },
        { path: 'scan', name: 'scan', component: () => import('@/views/customer/QrScanView.vue') },
        { path: 'plate', name: 'plate', component: () => import('@/views/customer/PlateEntryView.vue') },
        { path: 'ticket', name: 'ticket', component: () => import('@/views/customer/TicketEntryView.vue') },
        { path: 'search', name: 'search', component: () => import('@/views/customer/PhoneSearchView.vue') },
        { path: 'lookup', name: 'lookup', component: () => import('@/views/customer/LookingUpView.vue') },
        { path: 'session', name: 'session', component: () => import('@/views/customer/SessionView.vue') },
        { path: 'validation', name: 'validation', component: () => import('@/views/customer/ValidationView.vue') },
        { path: 'payment', name: 'payment', component: () => import('@/views/customer/PaymentView.vue') },
        { path: 'processing', name: 'processing', component: () => import('@/views/customer/ProcessingView.vue') },
        { path: 'confirm', name: 'confirm', component: () => import('@/views/customer/ConfirmationView.vue') },
        { path: 'receipt', name: 'receipt', component: () => import('@/views/customer/ReceiptView.vue') },
        { path: 'signin', name: 'signin', component: () => import('@/views/customer/SignInView.vue') },
        { path: 'signin/link', name: 'signin-link', component: () => import('@/views/customer/MagicLinkView.vue') },
        { path: 'signin/forgot', name: 'signin-forgot', component: () => import('@/views/customer/ForgotPasswordView.vue') },
        { path: 'signin/reset', name: 'signin-reset', component: () => import('@/views/customer/ResetPasswordView.vue') },
        { path: 'account', name: 'account', component: () => import('@/views/customer/AccountView.vue') },
        { path: 'account/history', name: 'payment-history', component: () => import('@/views/customer/PaymentHistoryView.vue') },
        { path: 'account/vehicles', name: 'vehicles', component: () => import('@/views/customer/VehiclesView.vue') },
        { path: 'account/cards', name: 'cards', component: () => import('@/views/customer/CardsView.vue') },
        { path: 'account/topup', name: 'topup', component: () => import('@/views/customer/TopUpView.vue') },
        { path: 'account/topup/pay', name: 'topup-pay', component: () => import('@/views/customer/TopUpPaymentView.vue') },
        { path: 'account/topup/confirm', name: 'topup-confirm', component: () => import('@/views/customer/TopUpConfirmView.vue') },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'transactions', name: 'admin-transactions', component: () => import('@/views/admin/TransactionsView.vue') },
        { path: 'transactions/:id', name: 'admin-transaction', component: () => import('@/views/admin/TransactionDetailView.vue') },
        { path: 'refunds', name: 'admin-refunds', component: () => import('@/views/admin/RefundsView.vue') },
        { path: 'customers', name: 'admin-customers', component: () => import('@/views/admin/CustomersView.vue') },
        { path: 'customers/:id', name: 'admin-customer', component: () => import('@/views/admin/CustomerDetailView.vue') },
        { path: 'organisations', name: 'admin-organisations', component: () => import('@/views/admin/OrganisationsView.vue') },
        { path: 'organisations/:id', name: 'admin-organisation', component: () => import('@/views/admin/OrganisationDetailView.vue') },
        { path: 'validations', name: 'admin-validations', component: () => import('@/views/admin/ValidationsView.vue') },
        { path: 'credit', name: 'admin-credit', component: () => import('@/views/admin/CreditView.vue') },
        { path: 'audit', name: 'admin-audit', component: () => import('@/views/admin/AuditView.vue') },
        { path: 'config', name: 'admin-config', component: () => import('@/views/admin/ConfigView.vue') },
      ],
    },
  ],
})

export default router

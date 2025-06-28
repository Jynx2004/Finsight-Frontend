'use client'
import React, { useState, useEffect } from 'react'
import { getTransactions } from '../apiprovider/transactions/transactions'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  DialogContent,
  DialogActions,
  DialogTitle
} from '@mui/material'
import { DataGrid, GridColDef, Toolbar, ToolbarButton, useGridApiRef } from '@mui/x-data-grid'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import { Dialog } from '@mui/material'
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2'
import ReceiptIcon from '@mui/icons-material/Receipt'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import CalculateIcon from '@mui/icons-material/Calculate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import debounce from 'debounce'
import { Navbar } from '../components/navbarprotected'

// Register Chart.js components
ChartJS.register(ArcElement, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

export default function DashboardPage() {
  const apiRef = useGridApiRef() // Add apiRef for export control
  interface TransactionType {
    id: number
    date: string // ISO date string
    amount: number
    category: string
    status: string
    user_id: string
    user_profile: string
  }

  interface ColumnsList {
    id: boolean
    date: boolean // ISO date string
    amount: boolean
    category: boolean
    status: boolean
    user_id: boolean
    user_profile: boolean
  }

  const column_options: ColumnsList = {
    id: true,
    date: true,
    amount: true,
    category: true,
    status: true,
    user_id: true,
    user_profile: true
  }

  interface CellType {
    row: TransactionType
  }
  const [modalopen, setModalOpen] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<TransactionType[]>([])
  const [transactionsdebounce, setTransactionsDebounce] = useState<TransactionType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [rowCount, setRowCount] = useState(0)
  const [columnOptions, setColumnOptions] = useState<ColumnsList>(column_options)
  const [searchInput, setSearchInput] = useState('')
  const [stats, setStats] = useState<{
    totalTransactions: number
    totalRevenue: number
    avgTransaction: number
    paidTransactions: number
    categoryDistribution: Record<string, number>
    monthlyRevenue: { month: string; amount: number }[]
    monthlyExpenses: { month: string; amount: number }[]
    topUsers: { user_id: string; amount: number }[]
    statusDistribution: Record<string, number>
    topCategoriesByAmount: { category: string; amount: number }[]
    userMetrics: any[]
  }>({
    totalTransactions: 0,
    totalRevenue: 0,
    avgTransaction: 0,
    paidTransactions: 0,
    categoryDistribution: {},
    monthlyRevenue: [],
    monthlyExpenses: [],
    topUsers: [],
    statusDistribution: {},
    topCategoriesByAmount: [],
    userMetrics: []
  })

  const handleCheckboxChange = (key: keyof ColumnsList) => {
    setColumnOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const exportDataAsCSV = () => {
    // Filter columns based on columnOptions
    const selectedColumns = Object.keys(columnOptions).filter(
      key => columnOptions[key as keyof ColumnsList]
    ) as (keyof TransactionType)[]
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export.')
      return
    }

    // Create headers from selected columns
    const headers = selectedColumns.join(',')
    // Create rows with only selected columns
    const rows = transactionsdebounce.map(obj =>
      selectedColumns.map(key => `"${String(obj[key] || '').replace(/"/g, '""')}"`).join(',')
    )
    const csvContent = [headers, ...rows].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'transactions.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  console.log('logging the columns list', columnOptions)

  const columns: GridColDef[] = [
    {
      flex: 0.15,
      field: 'user_profile',
      minWidth: 170,
      headerName: 'User Profile',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={row.user_profile}
            alt='User Profile'
            sx={{
              width: 40,
              height: 40,
              border: '1px solid #ffffff',
              backgroundColor: '#333333'
            }}
            imgProps={{
              onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = '/fallback-image.png'
              }
            }}
          />
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'user_id',
      minWidth: 170,
      headerName: 'User ID',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.user_id}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'ID',
      minWidth: 170,
      headerName: 'Transaction ID',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.id}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'date',
      minWidth: 170,
      headerName: 'Date',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {new Date(row.date).toLocaleDateString()}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'amount',
      minWidth: 170,
      headerName: 'Amount',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            ${row.amount.toFixed(2)}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'category',
      minWidth: 170,
      headerName: 'Category',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.category}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      field: 'status',
      minWidth: 170,
      headerName: 'Status',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.status}
          </Typography>
        </Box>
      )
    }
  ]

  // Debounced search function
  const handleSearch = debounce((value: string) => {
    const filtered = transactions.filter(tx => tx.user_id.toLowerCase().includes(value.toLowerCase()))
    setTransactionsDebounce(filtered)
  }, 300)

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchInput(value)
    handleSearch(value)
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(paginationModel.page + 1)
        setTransactions(data.transactions)
        setTransactionsDebounce(data.transactions)
        setRowCount(data.totalTransactions)

        // Compute statistics
        const totalTransactions = data.transactions.length
        const totalRevenue = data.transactions.reduce((sum: number, tx: TransactionType) => sum + tx.amount, 0)
        const avgTransaction = totalRevenue / totalTransactions || 0
        const paidTransactions = data.transactions.filter((tx: TransactionType) => tx.status === 'Paid').length

        // Category distribution
        const categoryDistribution = data.transactions.reduce((acc: any, tx: TransactionType) => {
          acc[tx.category] = (acc[tx.category] || 0) + 1
          return acc
        }, {})

        // Monthly revenue (group by month)
        const monthlyRevenue = data.transactions.reduce((acc: any, tx: TransactionType) => {
          if (tx.category === 'Revenue') {
            const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' })
            console.log('Revenue Month:', month, 'Amount:', tx.amount)
            acc[month] = (acc[month] || 0) + tx.amount
          }
          return acc
        }, {})

        // Monthly expenses (group by month)
        const monthlyExpenses = data.transactions.reduce((acc: any, tx: TransactionType) => {
          if (tx.category === 'Expense') {
            const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' })
            console.log('Expense Month:', month, 'Amount:', tx.amount)
            acc[month] = (acc[month] || 0) + tx.amount
          }
          return acc
        }, {})

        // Top users by transaction amount
        const userTotals = data.transactions.reduce((acc: any, tx: TransactionType) => {
          acc[tx.user_id] = (acc[tx.user_id] || 0) + tx.amount
          return acc
        }, {})
        const topUsers = Object.entries(userTotals)
          .map(([user_id, amount]) => ({ user_id, amount: Number(amount) }))
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5)

        // Status distribution
        const statusDistribution = data.transactions.reduce((acc: any, tx: TransactionType) => {
          acc[tx.status] = (acc[tx.status] || 0) + 1
          return acc
        }, {})

        // Top categories by amount
        const categoryTotals = data.transactions.reduce((acc: any, tx: TransactionType) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount
          return acc
        }, {})
        const topCategoriesByAmount = Object.entries(categoryTotals)
          .map(([category, amount]) => ({ category, amount: Number(amount) }))
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5)

        // User metrics
        const userMetrics = data.transactions.reduce((acc: any, tx: TransactionType) => {
          if (!acc[tx.user_id]) {
            acc[tx.user_id] = {
              revenuePaid: 0,
              expensePaid: 0,
              revenuePending: 0,
              expensePending: 0
            }
          }
          if (tx.category === 'Revenue' && tx.status === 'Paid') {
            acc[tx.user_id].revenuePaid += tx.amount
          } else if (tx.category === 'Expense' && tx.status === 'Paid') {
            acc[tx.user_id].expensePaid += tx.amount
          } else if (tx.category === 'Revenue' && tx.status === 'Pending') {
            acc[tx.user_id].revenuePending += tx.amount
          } else if (tx.category === 'Expense' && tx.status === 'Pending') {
            acc[tx.user_id].expensePending += tx.amount
          }
          return acc
        }, {})
        const userMetricsData = Object.entries(userMetrics).map(([user_id, metrics]) => ({
          user_id,
          ...(metrics as Record<string, number>)
        }))

        setStats({
          totalTransactions,
          totalRevenue,
          avgTransaction,
          paidTransactions,
          categoryDistribution,
          monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount: Number(amount) })),
          topUsers,
          statusDistribution,
          topCategoriesByAmount,
          monthlyExpenses: Object.entries(monthlyExpenses).map(([month, amount]) => ({
            month,
            amount: Number(amount)
          })),
          userMetrics: userMetricsData
        })
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    fetchTransactions()
  }, [paginationModel.page])

  // Chart.js data for Pie chart (Category Distribution)
  const pieChartData = {
    labels: Object.keys(stats.categoryDistribution),
    datasets: [
      {
        data: Object.values(stats.categoryDistribution),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  }

  // Chart.js data for Line chart (Monthly Revenue)
  const lineChartData = {
    labels: stats.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: stats.monthlyRevenue.map(item => item.amount),
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1
      }
    ]
  }

  // Chart.js data for Bar chart (Top 5 Users by Transaction Amount)
  const barChartData = {
    labels: stats.topUsers.map(user => user.user_id),
    datasets: [
      {
        label: 'Total Amount',
        data: stats.topUsers.map(user => user.amount),
        backgroundColor: '#FF6384',
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  }

  // Chart.js data for Bar chart (Status Distribution)
  const statusBarChartData = {
    labels: Object.keys(stats.statusDistribution),
    datasets: [
      {
        label: 'Transaction Count',
        data: Object.values(stats.statusDistribution),
        backgroundColor: '#4BC0C0',
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  }

  // Chart.js data for Grouped Bar chart (User Metrics)
  const userMetricsBarChartData = {
    labels: stats.userMetrics.map(item => item.user_id),
    datasets: [
      {
        label: 'Revenue Paid',
        data: stats.userMetrics.map(item => item.revenuePaid),
        backgroundColor: '#36A2EB',
        borderColor: '#ffffff',
        borderWidth: 1
      },
      {
        label: 'Expense Paid',
        data: stats.userMetrics.map(item => item.expensePaid),
        backgroundColor: '#FF6384',
        borderColor: '#ffffff',
        borderWidth: 1
      },
      {
        label: 'Revenue Pending',
        data: stats.userMetrics.map(item => item.revenuePending),
        backgroundColor: '#FFCE56',
        borderColor: '#ffffff',
        borderWidth: 1
      },
      {
        label: 'Expense Pending',
        data: stats.userMetrics.map(item => item.expensePending),
        backgroundColor: '#4BC0C0',
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          position: 'relative',
          top: '70px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          p: 3,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#121212'
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: '1.8rem',
              sm: '2.5rem',
              md: '3rem'
            },
            fontWeight: 'bold',
            textAlign: 'center',
            paddingBottom: '1rem',
            background: 'linear-gradient(90deg,rgb(211, 218, 211),rgb(60, 62, 60))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.1rem'
          }}
        >
          DASHBOARD
        </Typography>

        {/* First Row: 4 Cards with Icons */}
        <Box
          sx={{
            width: '85%',
            margin: 'auto',
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Card sx={{ flex: 1, minWidth: 0, height: '150px', background: 'black' }}>
            <CardContent
              sx={{
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ReceiptIcon sx={{ fontSize: 32, color: '#36A2EB', mb: 1 }} />
              <Typography
                variant='h6'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                Total Transactions
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                {stats.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 0, height: '150px', background: 'black' }}>
            <CardContent
              sx={{
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MonetizationOnIcon sx={{ fontSize: 32, color: '#4BC0C0', mb: 1 }} />
              <Typography
                variant='h6'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                Total Revenue
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                ${stats.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 0, height: '150px', background: 'black' }}>
            <CardContent
              sx={{
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalculateIcon sx={{ fontSize: 32, color: '#FFCE56', mb: 1 }} />
              <Typography
                variant='h6'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                Avg. Transaction
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                ${stats.avgTransaction.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 0, height: '150px', background: 'black' }}>
            <CardContent
              sx={{
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 32, color: '#9966FF', mb: 1 }} />
              <Typography
                variant='h6'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                Paid Transactions
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontSize: {
                    xs: '1rem', // small screens
                    sm: '1.25rem',
                    md: '1.5rem'
                  }
                }}
              >
                {stats.paidTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Second Row: 2 Larger Cards with Charts */}
        <Box
          sx={{
            width: '85%',
            margin: 'auto',
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Card
            sx={{
              flex: 1,
              minWidth: 0,
              height: '300px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                Category Distribution
              </Typography>
              <Box sx={{ position: 'relative', bottom: '5px' }}>
                <Pie
                  data={pieChartData}
                  options={{
                    plugins: {
                      legend: { labels: { color: '#ffffff' } }
                    },
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </Box>
            </CardContent>
          </Card>
          {/* <Card
          sx={{
            flex: 1,
            minWidth: 0,
            height: '300px',
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
            <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
              Monthly Revenue
            </Typography>
            <Box sx={{ position: 'relative', bottom: '5px' }}>
              <Line
                data={lineChartData}
                options={{
                  plugins: {
                    legend: { labels: { color: '#ffffff' } }
                  },
                  scales: {
                    x: { ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                  },
                  maintainAspectRatio: false
                }}
                height={200}
              />
            </Box>
          </CardContent>
        </Card> */}
          <Card
            sx={{
              flex: 1,
              minWidth: 0,
              height: '300px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                Monthly Revenue and Expenses
              </Typography>
              <Box sx={{ position: 'relative', bottom: '5px' }}>
                {/* <Line
                data={{
                  labels: stats.monthlyRevenue.map(item => item.month),
                  datasets: [
                    {
                      label: 'Revenue',
                      data: stats.monthlyRevenue.map(item => item.amount),
                      fill: false,
                      borderColor: '#36A2EB',
                      tension: 0.1
                    },
                    {
                      label: 'Expenses',
                      data: stats.monthlyExpenses.map(item => item.amount),
                      fill: false,
                      borderColor: '#FF6384',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: '#ffffff' } }
                  },
                  scales: {
                    x: { ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                  },
                  maintainAspectRatio: false
                }}
                height={200}
              /> */}
                <Line
                  data={{
                    labels: Array.from(
                      new Set([
                        ...stats.monthlyRevenue.map(item => item.month),
                        ...stats.monthlyExpenses.map(item => item.month)
                      ])
                    ).sort((a, b) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime()),

                    datasets: [
                      {
                        label: 'Revenue',
                        data: Array.from(
                          new Set([
                            ...stats.monthlyRevenue.map(item => item.month),
                            ...stats.monthlyExpenses.map(item => item.month)
                          ])
                        )
                          .sort((a, b) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime())
                          .map(month => {
                            const found = stats.monthlyRevenue.find(item => item.month === month)
                            return found ? found.amount : 0
                          }),
                        fill: false,
                        borderColor: '#36A2EB',
                        tension: 0.1
                      },
                      {
                        label: 'Expenses',
                        data: Array.from(
                          new Set([
                            ...stats.monthlyRevenue.map(item => item.month),
                            ...stats.monthlyExpenses.map(item => item.month)
                          ])
                        )
                          .sort((a, b) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime())
                          .map(month => {
                            const found = stats.monthlyExpenses.find(item => item.month === month)
                            return found ? found.amount : 0
                          }),
                        fill: false,
                        borderColor: '#FF6384',
                        tension: 0.1
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: { labels: { color: '#ffffff' } }
                    },
                    scales: {
                      x: { ticks: { color: '#ffffff' } },
                      y: { ticks: { color: '#ffffff' } }
                    },
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </Box>
            </CardContent>
          </Card>
          {/* <Card
          sx={{
            flex: 1,
            minWidth: 0,
            height: '300px',
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
            <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
              Top 5 Users by Amount
            </Typography>
            <Box sx={{ position: 'relative', bottom: '5px' }}>
              <Bar
                data={barChartData}
                options={{
                  plugins: {
                    legend: { labels: { color: '#ffffff' } }
                  },
                  scales: {
                    x: { ticks: { color: '#ffffff' } },
                    y: { ticks: { color: '#ffffff' } }
                  },
                  maintainAspectRatio: false
                }}
                height={200}
              />
            </Box>
          </CardContent>
        </Card> */}
        </Box>

        {/* Third Row: 2 Additional Cards with Charts */}
        <Box
          sx={{
            width: '85%',
            margin: 'auto',
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Card
            sx={{
              flex: 1,
              minWidth: 0,
              height: '300px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                Status Distribution
              </Typography>
              <Box sx={{ position: 'relative', bottom: '5px' }}>
                <Bar
                  data={statusBarChartData}
                  options={{
                    plugins: {
                      legend: { labels: { color: '#ffffff' } }
                    },
                    scales: {
                      x: { ticks: { color: '#ffffff' } },
                      y: { ticks: { color: '#ffffff' } }
                    },
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </Box>
            </CardContent>
          </Card>
          <Card
            sx={{
              flex: 1,
              minWidth: 0,
              height: '300px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                Top 5 Users by Amount
              </Typography>
              <Box sx={{ position: 'relative', bottom: '5px' }}>
                <Bar
                  data={barChartData}
                  options={{
                    plugins: {
                      legend: { labels: { color: '#ffffff' } }
                    },
                    scales: {
                      x: { ticks: { color: '#ffffff' } },
                      y: { ticks: { color: '#ffffff' } }
                    },
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </Box>
            </CardContent>
          </Card>
          {/* <Card
          sx={{
            flex: 1,
            minWidth: 0,
            height: '300px',
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
            <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
              Top 5 Categories by Amount
            </Typography>
            <Box sx={{ position: 'relative', bottom: '5px' }}>
              <Doughnut
                data={doughnutChartData}
                options={{
                  plugins: {
                    legend: { labels: { color: '#ffffff' } }
                  },
                  maintainAspectRatio: false
                }}
                height={200}
              />
            </Box>
          </CardContent>
        </Card> */}
        </Box>

        {/* Fourth Row: User Metrics Chart */}
        <Box
          sx={{
            width: '85%',
            margin: 'auto',
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Card
            sx={{
              width: '100%',
              height: '300px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ color: 'white', textAlign: 'center', width: '100%', height: '300px' }}>
              <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                User Transaction Metrics
              </Typography>
              <Box sx={{ position: 'relative', bottom: '5px' }}>
                <Bar
                  data={userMetricsBarChartData}
                  options={{
                    plugins: {
                      legend: { labels: { color: '#ffffff' } }
                    },
                    scales: {
                      x: { ticks: { color: '#ffffff' } },
                      y: { ticks: { color: '#ffffff' } }
                    },
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* DataGrid */}
        <Box
          sx={{
            flexGrow: 1,
            width: '85%',
            margin: 'auto',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Typography variant='h5' sx={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
            TRANSACTIONS
          </Typography>
          <Box
            sx={{
              width: '30%',
              //margin: 'auto',
              mb: 3,
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              gap: '1rem'
            }}
          >
            <TextField
              fullWidth
              label='Search by User ID'
              variant='outlined'
              value={searchInput}
              onChange={handleInputChange}
              sx={{
                '& .MuiInputBase-input': { color: '#ffffff' },
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ffffff' },
                  '&:hover fieldset': { borderColor: '#36A2EB' },
                  '&.Mui-focused fieldset': { borderColor: '#36A2EB' }
                }
              }}
            />
            <Button
              variant='outlined'
              startIcon={<SaveAltIcon />}
              onClick={() => {
                // if (apiRef.current) {
                //   apiRef.current.exportDataAsCsv({ fileName: 'transactions_export' })
                // }
                setModalOpen(true)
              }}
              sx={{
                color: '#ffffff',
                borderColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#333333',
                  borderColor: '#36A2EB'
                },
                whiteSpace: 'nowrap',
                padding: '1rem',
                width: '150px'
              }}
            >
              Export
            </Button>
          </Box>
          <DataGrid
            rowHeight={62}
            rows={transactionsdebounce}
            rowCount={rowCount}
            paginationMode='server'
            columns={columns}
            //slots={{ toolbar: Toolbar }}
            disableRowSelectionOnClick
            getRowId={row => row.id}
            paginationModel={paginationModel}
            apiRef={apiRef}
            onPaginationModelChange={newModel => setPaginationModel(newModel)}
            sx={{
              backgroundColor: '#000000',
              padding: '16px',
              '& .MuiDataGrid-cell': {
                color: '#ffffff !important',
                padding: '16px',
                '& .MuiTypography-root': {
                  color: '#ffffff !important'
                }
              },
              '& .MuiDataGrid-row': {
                color: '#ffffff !important',
                '& .MuiTypography-root': {
                  color: '#ffffff !important'
                }
              },
              '& .MuiDataGrid-row:hover': {
                color: '#ffffff !important',
                backgroundColor: '#333333 !important',
                '& .MuiTypography-root': {
                  color: '#ffffff !important'
                }
              },
              '& .MuiDataGrid-columnHeader': {
                color: '#ffffff !important',
                backgroundColor: '#000000',
                padding: '16px'
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: '#ffffff !important',
                fontSize: '1.2rem' // Increased font size for column titles
              },
              '& .MuiDataGrid-footerContainer': {
                color: '#ffffff !important',
                backgroundColor: '#000000',
                padding: '16px',
                '& .MuiTablePagination-root': {
                  color: '#ffffff !important'
                },
                '& .MuiTablePagination-selectLabel': {
                  color: '#ffffff !important'
                },
                '& .MuiTablePagination-displayedRows': {
                  color: '#ffffff !important'
                },
                '& .MuiSelect-icon': {
                  color: '#ffffff !important'
                }
              },
              '& .MuiDataGrid-sortIcon': {
                color: '#ffffff !important'
              },
              '& .MuiDataGrid-menuIcon': {
                color: '#ffffff !important'
              },
              '& .MuiDataGrid-menuIconButton': {
                color: '#ffffff !important'
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: '#000000'
              },
              '& .MuiDataGrid-overlay': {
                color: '#ffffff !important',
                backgroundColor: '#000000'
              }
            }}
          />
        </Box>
      </Box>
      <Dialog
        open={modalopen}
        onClose={() => setModalOpen(false)}
        maxWidth='sm'
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#000000',
            color: '#ffffff'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1976d2' }}>
          Select the no of columns to export
        </DialogTitle>

        <DialogContent>
          {/* Column Options Checkboxes */}
          <div className='mb-6'>
            <div className='grid grid-cols-2 gap-2'>
              {Object.keys(columnOptions).map(key => (
                <label key={key} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id={key}
                    checked={columnOptions[key as keyof ColumnsList]}
                    onChange={() => handleCheckboxChange(key as keyof ColumnsList)}
                    className='h-4 w-4 text-blue-600 border-gray-300 rounded'
                  />
                  <span className='text-white capitalize'>{key.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              exportDataAsCSV()
              setModalOpen(false)
            }}
            startIcon={<SaveAltIcon />}
            color='primary'
            variant='outlined'
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

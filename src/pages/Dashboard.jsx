import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Chart from 'react-apexcharts'
import statusCard from '../assets/JsonData/status-card-data.json'
import { StatusCard } from '../component/status-card/StatusCard'
import Table from '../component/table/Table'
import { useSelector } from 'react-redux'
import api from '../assets/JsonData/api.json'
import { getData } from '../utils/fecthData'

const chartOptions = {
    color: ['#6ab04c', '#2980b9'],
    chart: {
        background: 'transparent'
    },
    dataLabels: {
        enabled: true
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    legend: {
        position: 'top'
    },
    grid: {
        show: false
    }
}
const topCustomerHeader = [
    'Tên',
    'lượt mua',
    'tổng tiền'
]

const latestOrderHeader = [
    "Id",
    "Người mua",
    "Tổng tiền",
    "Thời gian",
]

const renderCustomerHead = (item, index) => (
    <th key={index}>{item}</th>
)
const renderCustomerBody = (item, index) => {
    return (
        <tr key={index}>
            <td>{item.username}</td>
            <td>{new Intl.NumberFormat().format(item.order)}</td>
            <td>{"$" + new Intl.NumberFormat().format(item.price)}</td>
        </tr>
    )
}




const renderOrderHead = (item, index) => (
    <th key={index}>{item}</th>
)

const renderOrderBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.user}</td>
        <td>{"$" + new Intl.NumberFormat().format(item.price)}</td>
        <td>{item.date}</td>
    </tr>
)
const Dashboard = () => {
    const [serial, setSerial] = useState([
        {
            name: 'Học viên mới',
            data: []
        },
        {
            name: 'Doanh thu',
            data: []
        }
    ])
    const [counter, setCounter] = useState([])
    const [students, setStudents] = useState([])
    const [newOrders, setNewOrders] = useState([])
    const themeReducer = useSelector(state => state.ThemeReducer.mode)


    const initData = ()=>{
        getData(api.find((e) => e.pages === "Tổng quan").api['get-chart']).then(
            data => {
                console.log(data)
                setSerial([
                    {
                        name: 'Học viên mới',
                        data: data.newstudent
                    },
                    {
                        name: 'Doanh thu',
                        data: data.revune
                    }
                ])
            }
        )
        getData(api.find((e) => e.pages === "Tổng quan").api['get-counter']).then(
            data => {
                setCounter([
                    data.courseTotal,
                    data.studentTotal,
                    data.revune,
                    data.payTotal
                ])
            }
        )
        getData(api.find((e) => e.pages === "Tổng quan").api['get-top_student']).then(data => setStudents(data))
        getData(api.find((e) => e.pages === "Tổng quan").api['get-new_order']).then(data=>setNewOrders(data))
    }
    useEffect(() => {
     initData()
    }, [])

    return (
        <div>
            <h2 className="page-header">Tổng quan</h2>
            <div className="row">
                <div className="col-6">
                    <div className="row">
                        {
                            statusCard.map((item, index) => (
                                <div key={index} className="col-6">
                                    <StatusCard
                                        icon={item.icon}
                                        count={counter[index]}
                                        title={item.title}
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="col-6">
                    <div className="card full-height">
                        <Chart
                            options={themeReducer === 'theme-mode-dark' ? {
                                ...chartOptions,
                                theme: { mode: 'dark' }
                            } : {
                                ...chartOptions,
                                theme: { mode: 'light' }
                            }}
                            series={serial}
                            type='line'
                            height='100%'
                        />
                    </div>
                </div>
                <div className="col-5">
                    <div className="card">
                        <div className="card_header">
                            <h3>Học viên tiêu biểu</h3>
                        </div>
                        <div className="card_body">
                            {
                                students.length > 0 ? <Table
                                    headeData={topCustomerHeader}
                                    renderHead={(item, index) => renderCustomerHead(item, index)}
                                    bodyData={students}
                                    renderBody={(item, index) => renderCustomerBody(item, index)}
                                /> : ''
                            }
                        </div>
                        <div className="card_footer">
                            <Link to='/'>View All</Link>
                        </div>
                    </div>
                </div>
                <div className="col-7">
                    <div className="card">
                        <div className="card_header">
                            <h3>Mới bán</h3>
                        </div>
                        <div className="card_body">
                            {
                                newOrders.length > 0 ? <Table
                                    headeData={latestOrderHeader}
                                    renderHead={(item, index) => renderOrderHead(item, index)}
                                    bodyData={newOrders}
                                    renderBody={(item, index) => renderOrderBody(item, index)}
                                /> : ''
                            }
                        </div>
                        <div className="card_footer">
                            <Link to='/'>View All</Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default Dashboard
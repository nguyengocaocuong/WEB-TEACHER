import api from './assets/JsonData/api.json'
import { Account } from "./Model"
import { getData } from "./utils/fecthData"

export const checkToken = async () => {
    if (localStorage.getItem('token-teacher') === null || localStorage.getItem('token-teacher') === undefined) return null
    try {
        let data = await getData(api.find(e => e.pages === 'Đăng nhập').api['check-token'])
        let teacher = new Account()
        teacher.account = data.userName
        teacher.avatar = data.image
        localStorage.setItem('teacher', JSON.stringify(teacher))
        return 1
    }
    catch (err) {
        console.log(err)
    }
    return 0
}

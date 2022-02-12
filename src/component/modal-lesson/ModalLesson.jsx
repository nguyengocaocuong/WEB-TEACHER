import React, { useState, useRef } from 'react'
import './modalLesson.css'
import Modal from 'react-modal'
import api from '../../assets/JsonData/api.json'
import Axios from 'axios'
import { BarWave } from 'react-cssfx-loading/lib'
import { postData, putData } from '../../utils/fecthData'
import { toast } from 'react-toastify'
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

Modal.setAppElement('#root')



export default function ModalLesson(props) {
  const [tag, settag] = useState(0)
  const [modalIsOpen, setIsOpen] = React.useState(false)
  const choseFile_ref = useRef(null)
  const [loadStatus, setloadStatus] = useState(null)

  const [lesson, setLesson] = useState({
    Chap_ID: '',
    Lesson_header: '',
    Lesson_description: '',
    Lesson_video: null,
    Lesson_isFree: 1,
    Lesson_ID: null
  })
  const Lesson_isFreeList = ['Không học thử','Học thử']
  const [nameFile, setNameFile] = useState('')

  const handleChangeValue = (props) => (e) => {
    if (props === 'Lesson_isFree') {
      setLesson({ ...lesson, [props]: parseInt(e.target.value) })
      return
    }
    setLesson({ ...lesson, [props]: e.target.value })
    console.log(lesson)
  }
  const handleImageChange = (props) => (e) => {
    setLesson({ ...lesson, [props]: e.target.files[0] })
    setNameFile(e.target.files[0].name)
  }
  const resetModal = () => {
    setLesson({
      Chap_ID: '',
      Lesson_header: '',
      Lesson_description: '',
      Lesson_video: null,
      Lesson_isFree: 1,
      Lesson_ID: null
    })
    setNameFile('')
  }
  const openModal = (item) => {
    if (item !== null) {
      setLesson(item)
    }

    setIsOpen(true)
    document.getElementsByClassName('ReactModalPortal')[0].classList.add("active")
    settag(item != null ? 1 : 2)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const postLesson = (item, addLesson) => {

    const formData = new FormData()
    formData.append("file", lesson.Lesson_video)
    formData.append("upload_preset", "uploadvideo")
    Axios.post(api.find(e => e.pages === 'Thêm khóa học').api['upload-video'], formData).then((rs) => {
      const lessonData = {...lesson}
      lessonData.Chap_ID = item.Chap_ID
      lessonData.Lesson_video = rs.data.secure_url
      if (tag === 2) {
        setloadStatus(1)
        closeModal()
        postData(api.find(e => e.pages === 'Thêm khóa học').api['post-lesson'], lessonData)
          .then(
            data => {
              lessonData.Lesson_ID = data.LessonID
              addLesson(lessonData)
              setloadStatus(null)
              toast.success('Thêm mới bài giảng thành công')
              resetModal()
            }
          )
      } else {
        setloadStatus(1)
        closeModal()
        console.log("lesson",lessonData)
        putData(api.find(e => e.pages === 'Thêm khóa học').api['update-lesson'] + lesson.Lesson_ID, lessonData)
          .then(
            res => {
              toast.success('Cập nhật bài giảng thành công')
              addLesson(lessonData)
              setloadStatus(null)
              resetModal()
            }
          )
      }
    })
  }
  const handle = () => {

  }

  const renderLessonItem = (item, index) => {
    return <li key={index} onClick={() => openModal(item)}>
      <span className="counter">{'Bài' + (index + 1) + ': '}</span>
      <span className="Lesson-name">{item.Lesson_header}</span>
      <span className="Lesson-tag">{item.Lesson_isFree == 1 ? 'Học thử' : ''}</span>
    </li>
  }
  return (
    <div>
      {
        props.content === 1 ?
          <button className='btn-open-modal' onClick={() => openModal(null)}><i className='bx bx-add-to-queue' ></i></button>
          :
          renderLessonItem(props.content.item, props.content.index)

      }
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div>
          <h3 className="Lesson_header-lesson">{props.Lesson_header}</h3>
          <div>
            <h4>Tên bài học</h4>
            <div className="input-group input-lesson">
              <i className='bx bxl-discourse'></i>
              <input
                type="text"
                placeholder="Nhập tên bài học .. "
                name='Lesson_header'
                value={lesson['Lesson_header']}
                onChange={handleChangeValue('Lesson_header')}

              />

            </div>
            <h4>Video cho khóa học</h4>
            <div className={`input-group input-lesson ${nameFile != null ? 'input-image' : ''}`}>
              {
                loadStatus != null ? <BarWave /> : ''
              }
              <i className='bx bx-image-add' ></i>
              <input
                type="text"
                name="name_file"
                value={nameFile != null ? nameFile : ''}
                placeholder='Video bài học' className='file-name'
                onChange={handle}
              />
              <button onClick={() => { choseFile_ref.current.click() }}>
                {lesson['Lesson_video'] != null ? 'Update video' : 'Chọn video'}
              </button>
              <input
                ref={choseFile_ref}
                type="file"
                name="Lesson_videoLesson"
                onChange={handleImageChange('Lesson_video')}
              />
            </div>
            <h4>Trạng thái bài học</h4>
            <div className="input-group input-lesson">
              <select
                name="state"
                value={lesson['Lesson_isFree'] === 0 ? lesson['Lesson_isFree'] : 1}
                onChange={handleChangeValue('Lesson_isFree')}>
                {
                  Lesson_isFreeList.map((items, index) => (
                    <option value={index} key={items}>{items}</option>
                  ))
                }
              </select>
            </div>
            <h4>Nhập thông tin mô tả bài học</h4>
            <div className="input-group textarea ">
              <textarea
                name="Lesson_description"
                value={lesson['Lesson_description']}
                placeholder='Mô tả khoá học'
                onChange={handleChangeValue('Lesson_description')}
                type="text"
              >
              </textarea>
            </div>
          </div>
        </div>

        <div className="list-active">
          <button onClick={closeModal} className="btn-close">Đóng</button>
          <button onClick={() => postLesson(props.item, props.content === 1 ? props.addLesson : props.updateLesson)} className="btn-save">{props.content === 1 ? 'Lưu' : 'Cập nhật'}</button>
        </div>
      </Modal>
    </div>
  )
}


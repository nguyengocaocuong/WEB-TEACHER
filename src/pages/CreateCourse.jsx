import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../assets/css/createCourse.css'
import api from '../assets/JsonData/api.json'
import { BarWave } from 'react-cssfx-loading/lib'
import ModalLesson from '../component/modal-lesson/ModalLesson'
import { toast } from 'react-toastify'
import { getData, postData, putData } from '../utils/fecthData'
import { Course } from '../Model'
import { Autocomplete, TextField } from "@mui/material";
import Axios from 'axios'



export const CreateCourse = () => {

  const [list_new_categories, setListNewCategories] = useState([])
  const [course, setCourse] = useState(new Course())

  const choseFile_ref = useRef(null)
  const [lesson, setlesson] = useState([])
  const [courseImageUrl, setCourseImageUrl] = useState(null)
  const { id } = useParams()
  const [newChap, setNewChap] = useState(null)

  const [loadStatus, setloadStatus] = useState(null)
  const handleChaneValueCourse = (e) => {
    const { name, value } = e.target

    // console.log(name,value)
    setCourse({ ...course, [name]: value })
    if (name === 'Course_category') {
      let tmpCourse = { ...course }
      tmpCourse.Tag_ID = []
      tmpCourse.Course_category = value
      setCourse({...tmpCourse})
    }
  }

  const createCourse = () => {
    if (course.Course_header === '' || course.Course_price === 0 || course.Course_category === null || course.Course_description === '') return
    let courseData = { ...course }
    courseData.Tag_ID = course.Tag_ID.map(item => item.Tag_ID)
    if (courseImageUrl === null && course.Course_ID !== null) {
      putData(api.find(e => e.pages === 'Thêm khóa học').api['update-course'] + course.Course_ID, courseData).then(
        () => toast.success('Cập nhật thành công')
      ).catch(() => toast.error('Cập nhật không thành công'))
    }
    if (courseImageUrl !== null) {
      const formData = new FormData()
      formData.append("file", courseImageUrl);
      formData.append("upload_preset", "uploadimage")
      Axios.post(api.find(e => e.pages === 'Thêm khóa học').api['upload-image'], formData, {
        onUploadProgress: ProgressEvent => {
          setloadStatus(1)
        }
      }).then((rs) => {
        course.Course_image = rs.data.secure_url
        courseData.Course_image = rs.data.secure_url
        setloadStatus(null)
        if (course.Course_ID !== null)
          putData(api.find(e => e.pages === 'Thêm khóa học').api['update-course'] + course.Course_ID, courseData).then(
            () => toast.success('Cập nhật thành công')
          ).catch(() => toast.error('Cập nhật không thành công'))
        else
          Axios.post('https://ltweb-backend.herokuapp.com/api/teacher/manage/addCourse', courseData, {
            headers: {
              'Content-Type': 'application/json;charset-UTF-8',
              "Accept": 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('token-teacher')}`
            }
          })
            .then(
              res => {
                setCourse({ ...course, ['Course_ID']: res.data.courseID })
                toast.success('Thêm thành công khóa học')
              }
            ).catch(() => toast.error('Thêm mới không thành công'))
      })
    }
  }
  useEffect(() => {
    getData(api.find(e => e.pages === 'Thêm khóa học').api['get-list_category'])
      .then(
        data => {
          setListNewCategories(data)
          course.Course_category = data[0].category.Category_ID
          course.Tag_ID = [data[0].tags[0]]
          setCourse({ ...course })
        }
      ).catch(error => {
        console.log("Error : ", error)
      })
  }, [])

  useEffect(() => {
    if (id !== undefined && list_new_categories.length > 0) {
      getData(api.find(e => e.pages === 'Thêm khóa học').api['get-infor_course'] + id)
        .then(
          data => {
            let tags = list_new_categories.find(item => item.category.Category_ID === data[0].Course_category).tags.filter(value => data[1].indexOf(value.Tag_ID) > -1)
            setCourse({ ...data[0], Tag_ID: tags })
            setlesson(data[2])
          }
        ).catch(error => {
          console.log("Error : ", error)
        })
    }
  }, [id, list_new_categories])

  const addNewLesson = (item) => {
    let tmpLesson = [...lesson]
    tmpLesson.find(e => e.chap.Chap_ID === item.Chap_ID).lesson.push(item)
    setlesson(tmpLesson)
  }

  const addNewChap = () => {
    const dataChap = {
      Course_ID: course.Course_ID,
      Chap_description: newChap
    }
    postData(api.find(e => e.pages === 'Thêm khóa học').api['post-chap'], dataChap)
      .then(
        data => {
          const currentlesson = lesson
          currentlesson.push({
            chap: {
              Chap_ID: data.chapID,
              Chap_description: newChap
            },
            lesson: []
          })
          setlesson(currentlesson)
          setNewChap('')
          toast.success('Thêm mới chương thành công')
        }
      ).catch(() => {
        toast.error('Thêm mới không thành công')
      })
  }


  const updateLesson = (item) => {
    // window.history.reload()
  }
  return (
    <div>
      <h2 className="page-header">Thêm khóa học mới</h2>
      <div className="row">
        <div className={course.Course_ID === null ? 'col-12' : 'col-8'}>
          <div className="card">
            <div className="card_header"><h3>Thông tin khóa học</h3></div>
            <div className="card_body">
              <div className="row">
                <div className="col-8">
                  <h4>Nhập tên khóa học</h4>
                  <div className="input-group">
                    <i className='bx bxl-discourse'></i>
                    <input
                      type="text"
                      placeholder="Tên khóa học"
                      name='Course_header'
                      value={course.Course_header}
                      onChange={(e) => { handleChaneValueCourse(e) }}
                    />
                  </div>
                  <h4>Nhập giá khóa học</h4>
                  <div className="input-group">
                    <i className='bx bx-dollar' ></i>
                    <input
                      type="number"
                      name="Course_price"
                      value={course.Course_price}
                      placeholder='Giá khóa học'
                      onChange={(e) => { handleChaneValueCourse(e) }} />
                  </div>
                  <h4>Chọn ảnh cho khóa học</h4>
                  <div className={`input-group ${course.Course_image != null ? 'input-image' : ''}`}>
                    {
                      course.Course_image != null ? <img src={course.Course_image} /> : loadStatus != null ? <BarWave /> : ''
                    }
                    <i className='bx bx-image-add' ></i>
                    <input
                      type="text"
                      name="name_file"
                      value={courseImageUrl != null ? courseImageUrl.name : ''}
                      placeholder='Ảnh minh họa' className='file-name'
                    />
                    <button onClick={() => { choseFile_ref.current.click() }}>
                      {course.Course_image != null ? 'Đổi ảnh' : 'Chọn ảnh'}
                    </button>
                    <input
                      ref={choseFile_ref}
                      type="file"
                      name="courseImage"
                      onChange={(e) => { setCourseImageUrl(e.target.files[0]) }}
                    />
                  </div>
                  <h4>Nhập thông tin mô tả khóa học</h4>
                  <div className="input-group textarea">
                    <textarea
                      name="Course_description"
                      onChange={(e) => { handleChaneValueCourse(e) }}
                      value={course.Course_description}>

                    </textarea>
                  </div>
                </div>
                <div className="col-4">
                  <div>
                    <h4>Chọn category</h4>
                    {
                      course.Course_category ?
                        <div className="input-group">
                          <select
                            name="Course_category"
                            value={course.Course_category}
                            onChange={(e) => { handleChaneValueCourse(e) }}
                            disabled={course.Course_ID === null ? false : true}
                          >
                            {
                              list_new_categories.map((item, index) => <option value={item.category.Category_ID} key={index}>{item.category.Category_name}</option>)
                            }
                          </select>
                        </div> : ''
                    }
                    <h4>Chọn tag</h4>
                    {
                      list_new_categories.length > 0 ?
                        <Autocomplete
                          multiple
                          options={course.Course_category === null ? list_new_categories[0].tags : list_new_categories.find(item => item.category.Category_ID == course.Course_category).tags}
                          getOptionLabel={option => option.Tag_name}
                          onChange={(event, value) => setCourse({ ...course, ['Tag_ID']: value })}
                          value={course.Tag_ID}
                          renderInput={(params) => (
                            <TextField {...params}
                              placeholder='Please chose products'
                            />
                          )}
                        />
                        : ''
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="card_footer">
              <button onClick={createCourse}>{course.Course_ID === null ? 'Lưu lại' : 'Cập nhật'}</button>
            </div>
          </div>
        </div>
        <div className={`col-4 ${course.Course_ID === null ? 'd-none' : ''}`}>
          <div className="card">
            <div className="card-header__lesson">
              <h3>Danh sách bài giảng</h3>
            </div>
            <div className="card-body__lesson">
              {
                lesson.length > 0 && lesson.map((item, index) => (
                  <div className="lesson-chap" key={index}>
                    {
                      <div className="lesson-chap-header">
                        <h5>{'Chương' + (index + 1) + ': ' + item.chap.Chap_description}</h5>
                        <ModalLesson
                          title="Thêm bài giảng"
                          item={item.chap}
                          content={1}
                          addLesson={addNewLesson}
                        />
                      </div>
                    }
                    {
                      <ul>
                        {
                          item.lesson.length ? item.lesson.map((it, idx) => (
                            <ModalLesson
                              key={idx}
                              title="Update bài giảng"
                              item={item.chap}
                              updateLesson={updateLesson}
                              content={
                                { index: idx, item: it }
                              }
                            />
                          )) : ''
                        }
                      </ul>
                    }
                  </div>
                ))
              }
              <div className="card-footer">
                <div className="row">
                  <div className="col-9">
                    <input type="text" placeholder='Tạo chương mới' value={newChap} onChange={(e) => setNewChap(e.target.value)} />
                  </div>
                  <div className="col-3">
                    <button onClick={addNewChap}>Thêm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleAnalyze = () => {
    if (!photo || !height || !weight) return
    // TODO: 분석 API 연동
    alert(`분석 시작\n키: ${height}cm / 몸무게: ${weight}kg`)
  }

  const isReady = photo && height && weight

  return (
    <div className="page">
      <header className="header">
        <span className="logo-icon">✦</span>
        <h1 className="logo-text">Personal Stylist Studio</h1>
      </header>

      <main className="main">
        <p className="subtitle">사진과 체형 정보를 입력하면 맞춤 스타일을 분석해드립니다</p>

        <div className="card">
          {/* 사진 업로드 */}
          <section className="section">
            <label className="section-label">내 사진</label>
            <div
              className={`upload-zone ${dragging ? 'dragging' : ''} ${photoPreview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="업로드된 사진" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">＋</span>
                  <p className="upload-text">클릭하거나 사진을 드래그하세요</p>
                  <p className="upload-hint">JPG, PNG, WEBP 지원</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {photoPreview && (
              <button
                className="change-photo-btn"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click() }}
              >
                사진 변경
              </button>
            )}
          </section>

          {/* 체형 정보 */}
          <section className="section">
            <label className="section-label">체형 정보</label>
            <div className="inputs-row">
              <div className="input-group">
                <label className="input-label" htmlFor="height">키</label>
                <div className="input-wrapper">
                  <input
                    id="height"
                    type="number"
                    className="input"
                    placeholder="170"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                  <span className="input-unit">cm</span>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="weight">몸무게</label>
                <div className="input-wrapper">
                  <input
                    id="weight"
                    type="number"
                    className="input"
                    placeholder="65"
                    min="30"
                    max="200"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="input-unit">kg</span>
                </div>
              </div>
            </div>
          </section>

          {/* 분석 버튼 */}
          <button
            className={`analyze-btn ${isReady ? 'ready' : ''}`}
            onClick={handleAnalyze}
            disabled={!isReady}
          >
            분석하기
          </button>

          {!isReady && (
            <p className="hint">
              {!photo && '사진을 업로드하고 '}
              {photo && (!height || !weight) && '키와 몸무게를 입력하고 '}
              분석하기 버튼을 눌러주세요
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

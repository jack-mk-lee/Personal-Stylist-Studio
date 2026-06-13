import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const resultRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setReport(null)
    setError(null)
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleAnalyze = async () => {
    if (!photo || !height || !weight) return
    setAnalyzing(true)
    setReport(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('height', height)
      formData.append('weight', weight)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      setReport(data.report)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
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
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
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
            className={`analyze-btn ${isReady && !analyzing ? 'ready' : ''}`}
            onClick={handleAnalyze}
            disabled={!isReady || analyzing}
          >
            {analyzing ? (
              <span className="btn-loading">
                <span className="spinner" />
                분석 중...
              </span>
            ) : '분석하기'}
          </button>

          {!isReady && !analyzing && (
            <p className="hint">
              {!photo ? '사진을 업로드하고 ' : ''}
              {photo && (!height || !weight) ? '키와 몸무게를 입력하고 ' : ''}
              분석하기 버튼을 눌러주세요
            </p>
          )}

          {error && <p className="error-msg">{error}</p>}
        </div>

        {/* 분석 결과 */}
        {report && (
          <div className="report" ref={resultRef}>
            <h2 className="report-title">✦ 스타일 컨설팅 보고서</h2>

            <div className="report-card">
              <h3 className="report-section-title">체형 분석</h3>
              <p className="report-body-type">{report.bodyType}</p>
            </div>

            <div className="report-grid">
              <div className="report-card">
                <h3 className="report-section-title">추천 스타일</h3>
                <ul className="report-list">
                  {report.recommendedStyles.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="report-card">
                <h3 className="report-section-title">어울리는 컬러</h3>
                <ul className="report-list color-list">
                  {report.colorPalette.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="report-card avoid">
              <h3 className="report-section-title">피해야 할 스타일</h3>
              <ul className="report-list">
                {report.avoidStyles.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="report-card tips">
              <h3 className="report-section-title">스타일링 팁</h3>
              <ol className="report-list tips-list">
                {report.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

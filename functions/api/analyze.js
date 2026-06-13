function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const formData = await request.formData()
    const photo = formData.get('photo')
    const height = formData.get('height')
    const weight = formData.get('weight')

    if (!photo || !height || !weight) {
      return Response.json({ error: '사진, 키, 몸무게를 모두 입력해주세요.' }, { status: 400 })
    }

    const arrayBuffer = await photo.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)
    const mimeType = photo.type || 'image/jpeg'

    const prompt = `당신은 전문 퍼스널 스타일리스트입니다. 사용자의 사진과 체형 정보를 바탕으로 맞춤 스타일 컨설팅 보고서를 작성해주세요.

사용자 정보:
- 키: ${height}cm
- 몸무게: ${weight}kg

아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.

{
  "bodyType": "체형 유형과 특징 설명 (2~3문장)",
  "recommendedStyles": ["추천 스타일 1", "추천 스타일 2", "추천 스타일 3", "추천 스타일 4"],
  "colorPalette": ["어울리는 색상 1", "어울리는 색상 2", "어울리는 색상 3", "어울리는 색상 4"],
  "avoidStyles": ["피해야 할 스타일 1", "피해야 할 스타일 2", "피해야 할 스타일 3"],
  "tips": ["스타일링 팁 1", "스타일링 팁 2", "스타일링 팁 3"]
}`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    const openaiData = await openaiRes.json()

    if (!openaiRes.ok) {
      return Response.json(
        { error: openaiData.error?.message || 'OpenAI API 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const report = JSON.parse(openaiData.choices[0].message.content)
    return Response.json({ report })
  } catch (err) {
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

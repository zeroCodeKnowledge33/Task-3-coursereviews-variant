import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    async function loadReview() {
      try {
        const res = await api.get(`/reviews/${id}`)
        const review = res.data.review

        setForm({
          courseCode: review.courseCode || '',
          rating: Number(review.rating) || 5,
          comment: review.comment || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load review')
      }
    }

    loadReview()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/reviews/${id}`, form)
      } else {
        await api.post('/reviews', form)
      }
      nav('/reviews')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save review')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium mb-1 block">Course code</span>
          <input
            className="input"
            name="courseCode"
            value={form.courseCode}
            onChange={onChange}
            placeholder="CS101"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium mb-1 block">Rating</span>
          <select className="input" name="rating" value={form.rating} onChange={onChange}>
            {[1, 2, 3, 4, 5].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium mb-1 block">Comment</span>
          <textarea
            className="input"
            name="comment"
            value={form.comment}
            onChange={onChange}
            rows={5}
            placeholder="Optional feedback"
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}

import { useState, useMemo, useEffect } from "react"
import { Container, Table, Button, Form, InputGroup } from "react-bootstrap"
import defaultEntries from "./defaultEntries.json"

const lang = "hr"
const STORAGE_KEY = "kuhar-calculator-state-v1"

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

function emptyEntry() {
  return { name: "", price: "", amount: "" }
}

function App() {
  const saved = loadState()

  const [currency, setCurrency] = useState(saved?.currency ?? "€")
  const [vat, setVat] = useState(saved?.vat ?? "25")
  const [margin, setMargin] = useState(saved?.margin ?? "100")
  const [entries, setEntries] = useState(
    saved?.entries ??
      defaultEntries.map((e) => ({
        name: e.name[lang],
        price: String(e.price),
        amount: String(e.amount),
      }))
  )

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currency, vat, margin, entries })
    )
  }, [currency, vat, margin, entries])

  const currencySymbol = currency || "€"

  const rowTotals = useMemo(
    () => entries.map((e) => (parseFloat(e.price) || 0) * (parseFloat(e.amount) || 0)),
    [entries]
  )

  const subtotal = rowTotals.reduce((a, b) => a + b, 0)
  const marginTotal = subtotal * (1 + (parseFloat(margin) || 0) / 100)
  const vatTotal = marginTotal * (1 + (parseFloat(vat) || 0) / 100)

  const fmt = (n) => `${n.toFixed(2)}${currencySymbol}`

  const updateEntry = (index, field, value) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  const deleteEntry = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const addEntry = () => {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  return (
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      <div className="bg-body-tertiary p-4 rounded shadow-sm">
        <Form.Group className="mb-4 d-flex align-items-center gap-2" style={{ maxWidth: "300px" }}>
          <Form.Label className="mb-0 text-nowrap">Znak za valutu:</Form.Label>
          <Form.Control
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="€"
          />
        </Form.Group>

        <Table bordered hover responsive className="align-middle">
          <caption className="caption-top fs-4 text-center text-body">
            Kalkulator jela i pića
          </caption>
          <thead>
            <tr>
              <th style={{ width: "1%" }}></th>
              <th>Namirnica</th>
              <th>Cijena po kg/l/kom</th>
              <th>Količina u kg/l/kom</th>
              <th>Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteEntry(index)}
                    aria-label="Obriši"
                  >
                    <TrashIcon />
                  </Button>
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateEntry(index, "name", e.target.value)}
                    placeholder="Kruh"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={entry.price}
                    onChange={(e) => updateEntry(index, "price", e.target.value)}
                    placeholder="3"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={entry.amount}
                    onChange={(e) => updateEntry(index, "amount", e.target.value)}
                    placeholder="0.5"
                  />
                </td>
                <td>{fmt(rowTotals[index] || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>
                <Button variant="primary" className="w-100" onClick={addEntry}>
                  Dodaj
                </Button>
              </td>
            </tr>
          </tfoot>
        </Table>

        <Table bordered className="align-middle mt-4 text-center">
          <thead>
            <tr>
              <th>Cijena namirnica</th>
              <th>
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>Marža</span>
                  <InputGroup size="sm" style={{ width: "auto" }}>
                    <Form.Control
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      placeholder="100"
                      style={{ width: "70px" }}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <span>PDV</span>
                  <InputGroup size="sm" style={{ width: "auto" }}>
                    <Form.Control
                      type="number"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      placeholder="25"
                      style={{ width: "70px" }}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{fmt(subtotal)}</td>
              <td>{fmt(marginTotal)}</td>
              <td>{fmt(vatTotal)}</td>
            </tr>
          </tbody>
        </Table>

        <div className="text-center mt-4">
          <a href="https://github.com/khan-milopan/Zavrsni-rad-Kuhar" className="link-info">
            GitHub
          </a>
          <div className="text-muted font-monospace" style={{ fontSize: "0.6rem" }}>2.0</div>
        </div>
      </div>
    </Container>
  )
}

export default App

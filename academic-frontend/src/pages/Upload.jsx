import { useState } from "react";
import axios from "../api/axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    department: "",
    year: "",
    semester: "",
    subject: "",
    category: "",
    sensitivity: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return setMessage("Please select a file");

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      await axios.post("/files/upload", formData);

      setMessage("File uploaded successfully!");
      setFile(null);
      setForm({
        department: "",
        year: "",
        semester: "",
        subject: "",
        category: "",
        sensitivity: ""
      });

    } catch (error) {
      setMessage("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        Upload Academic File
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
        </select>

        <select
          name="year"
          value={form.year}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Year</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>

        <select
          name="semester"
          value={form.semester}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Semester</option>
          {[...Array(8)].map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          <option value="NOTES">NOTES</option>
          <option value="LAB">LAB</option>
          <option value="QUESTION_PAPER">QUESTION_PAPER</option>
          <option value="ASSIGNMENT">ASSIGNMENT</option>
          <option value="MARKSHEET">MARKSHEET</option>
          <option value="OTHER">OTHER</option>
        </select>

        <select
          name="sensitivity"
          value={form.sensitivity}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Sensitivity</option>
          <option value="PUBLIC">PUBLIC</option>
          <option value="INTERNAL">INTERNAL</option>
          <option value="CONFIDENTIAL">CONFIDENTIAL</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg hover:opacity-90"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Upload;

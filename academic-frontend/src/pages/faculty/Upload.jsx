import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

function FacultyUpload() {
  const [file, setFile] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    year: "",
    semester: "",
    subject: "",
    unit: "",
    category: "",
    sensitivity: ""
  });

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/me", authConfig);
        const dept = res.data?.department?.name || "";
        setDepartmentName(dept);
      } catch (error) {
        console.error("Failed to load faculty profile", error);
      }
    };

    fetchProfile();
  }, [authConfig]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("department", departmentName);
      formData.append("year", form.year);
      formData.append("semester", form.semester);
      formData.append("subject", form.subject);
      formData.append("unit", form.unit);
      formData.append("category", form.category);
      formData.append("sensitivity", form.sensitivity);

      await axios.post("/files/upload", formData, authConfig);
      setMessage("File uploaded successfully");
      setFile(null);
      setForm({
        year: "",
        semester: "",
        subject: "",
        unit: "",
        category: "",
        sensitivity: ""
      });
    } catch (error) {
      setMessage(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-[#0B2E33] text-[#B8E3E9] shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold">Upload File</h2>
        <p className="text-[#93B1B5] mt-1">Department is auto-filled from your profile.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-700 mb-1">Department</label>
          <input
            type="text"
            value={departmentName}
            readOnly
            className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Year</label>
          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Semester</label>
          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Semester</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Unit</label>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="NOTES">NOTES</option>
            <option value="QUESTION_PAPER">QUESTION_PAPER</option>
            <option value="MARKSHEET">MARKSHEET</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="LAB">LAB</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Sensitivity</label>
          <select
            name="sensitivity"
            value={form.sensitivity}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">Select Sensitivity</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="INTERNAL">INTERNAL</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate-700 mb-1">Upload File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-[#0B2E33] text-[#B8E3E9] rounded-lg py-2 font-semibold hover:bg-[#4F7C82] transition"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="md:col-span-2 text-sm text-slate-700">{message}</p>
        )}
      </form>
    </div>
  );
}

export default FacultyUpload;

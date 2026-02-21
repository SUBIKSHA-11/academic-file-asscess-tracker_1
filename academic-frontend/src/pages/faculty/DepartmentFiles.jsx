import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Search, Eye, Download } from "lucide-react";

function DepartmentFiles() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("/faculty/all-files", authConfig);
        setFiles(res.data || []);
      } catch (error) {
        console.error("Failed to fetch department files", error);
      }
    };

    fetchFiles();
  }, [authConfig]);

  const handleView = async (id) => {
    try {
      const res = await axios.get(`/files/view/${id}`, {
        ...authConfig,
        responseType: "blob"
      });
      const fileURL = window.URL.createObjectURL(res.data);
      window.open(fileURL, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("View failed", error);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const res = await axios.get(`/files/download/${id}`, {
        ...authConfig,
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const filteredFiles = files.filter((file) => {
    const bySearch = file.fileName.toLowerCase().includes(search.toLowerCase());
    const byCategory = category ? file.category === category : true;
    const byDepartment = department ? file.department === department : true;
    return bySearch && byCategory && byDepartment;
  });

  const departments = [...new Set(files.map((f) => f.department).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#0B2E33] text-[#B8E3E9] shadow-md p-6">
        <h2 className="text-2xl font-bold">Department Files</h2>
        <p className="text-[#93B1B5] mt-1">View files from all departments based on access policy.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full md:max-w-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file name..."
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="NOTES">NOTES</option>
            <option value="LAB">LAB</option>
            <option value="QUESTION_PAPER">QUESTION_PAPER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="MARKSHEET">MARKSHEET</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">File Name</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Semester</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-left">Access</th>
              <th className="p-3 text-left">View Count</th>
              <th className="p-3 text-left">Download Count</th>
              <th className="p-3 text-center">View</th>
              <th className="p-3 text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <tr key={file._id} className="border-t border-slate-100">
                  <td className="p-3">{file.fileName}</td>
                  <td className="p-3">{file.subject}</td>
                  <td className="p-3">{file.semester}</td>
                  <td className="p-3">{file.department}</td>
                  <td className="p-3">{file.uploadedBy?.name || "-"}</td>
                  <td className="p-3">{file.sensitivity}</td>
                  <td className="p-3">{file.viewCount || 0}</td>
                  <td className="p-3">{file.downloadCount || 0}</td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleView(file._id)}
                      className="text-[#4F7C82] hover:text-[#0B2E33]"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDownload(file._id, file.fileName)}
                      className="text-[#4F7C82] hover:text-[#0B2E33]"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center text-slate-500">
                  No files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DepartmentFiles;

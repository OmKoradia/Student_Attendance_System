import { useEffect, useState } from "react";
import "./App.css";

function App() {

  // ==========================================
  // DATA
  // ==========================================

  const [branches, setBranches] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);

  // ==========================================
  // SELECTION
  // ==========================================

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  // ==========================================
  // ATTENDANCE
  // ==========================================

  const [attendance, setAttendance] = useState({});

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ==========================================
  // ATTENDANCE RECORD CARDS
  // ==========================================

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  // ==========================================
  // SELECTED ATTENDANCE DETAILS
  // ==========================================

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [attendanceDetails, setAttendanceDetails] =
    useState([]);


  // ==========================================
  // LOAD BRANCHES
  // ==========================================

  useEffect(() => {

    fetch("http://localhost:5000/branches")
      .then((response) => response.json())
      .then((data) => {

        setBranches(data);

      })
      .catch((error) => {

        console.log(error);

      });

  }, []);


  // ==========================================
  // LOAD ALL ATTENDANCE RECORDS
  // ==========================================

  const loadAttendanceRecords = () => {

    fetch("http://localhost:5000/attendance-records")
      .then((response) => response.json())
      .then((data) => {

        setAttendanceRecords(data);

      })
      .catch((error) => {

        console.log(error);

      });

  };


  // Load attendance records when website opens

  useEffect(() => {

    loadAttendanceRecords();

  }, []);


  // ==========================================
  // BRANCH CHANGE
  // ==========================================

  const handleBranchChange = (e) => {

    const branchId = e.target.value;

    setSelectedBranch(branchId);

    setSelectedDivision("");

    setDivisions([]);

    setStudents([]);

    setAttendance({});


    if (branchId === "") {

      return;

    }


    fetch(
      `http://localhost:5000/divisions/${branchId}`
    )
      .then((response) => response.json())
      .then((data) => {

        setDivisions(data);

      })
      .catch((error) => {

        console.log(error);

      });

  };


  // ==========================================
  // CONTINUE
  // ==========================================

  const handleContinue = () => {

    if (!selectedBranch || !selectedDivision) {

      alert(
        "Please select branch and division"
      );

      return;

    }


    fetch(
      `http://localhost:5000/students/${selectedDivision}`
    )
      .then((response) => response.json())
      .then((data) => {

        setStudents(data);


        // Set Present by default

        const defaultAttendance = {};


        data.forEach((student) => {

          defaultAttendance[student.id] =
            "Present";

        });


        setAttendance(
          defaultAttendance
        );

      })
      .catch((error) => {

        console.log(error);

      });

  };


  // ==========================================
  // CHANGE ATTENDANCE
  // ==========================================

  const handleAttendanceChange =
    (studentId, status) => {

      setAttendance({

        ...attendance,

        [studentId]: status

      });

    };


  // ==========================================
  // SAVE ATTENDANCE
  // ==========================================

  const saveAttendance = async () => {

    if (students.length === 0) {

      alert(
        "Please select a class first"
      );

      return;

    }


    try {

      for (const student of students) {

        await fetch(
          "http://localhost:5000/attendance",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              student_id:
                student.id,

              attendance_date:
                date,

              status:
                attendance[student.id]

            })

          }
        );

      }


      alert(
        "Attendance saved successfully!"
      );


      // Refresh attendance cards

      loadAttendanceRecords();


    } catch (error) {

      console.log(error);

      alert(
        "Error saving attendance"
      );

    }

  };


  // ==========================================
  // OPEN ATTENDANCE CARD
  // ==========================================

  const openAttendanceRecord =
    (record) => {

      setSelectedRecord(record);

      setAttendanceDetails([]);


      fetch(
        `http://localhost:5000/attendance-details/${record.attendance_date}/${record.division_id || getDivisionId(record)}`
      )
        .then((response) => response.json())
        .then((data) => {

          setAttendanceDetails(data);

        })
        .catch((error) => {

          console.log(error);

        });

    };


  // ==========================================
  // GET DIVISION ID
  // ==========================================

  const getDivisionId = (record) => {

    const division = divisions.find(
      (item) =>
        item.division_name ===
        record.division_name
    );


    if (division) {

      return division.id;

    }


    // Get division ID from backend
    // using branch and division name

    return "";

  };


  return (

    <div className="container">


      {/* =====================================
          MAIN HEADING
          ===================================== */}

      <h1>
        Student Attendance Management System
      </h1>


      {/* =====================================
          SELECT CLASS
          ===================================== */}

      <div className="selection-box">

        <h2>
          Select Class
        </h2>


        {/* Branch */}

        <label>
          Branch
        </label>

        <select
          value={selectedBranch}
          onChange={handleBranchChange}
        >

          <option value="">
            Select Branch
          </option>


          {branches.map((branch) => (

            <option
              key={branch.id}
              value={branch.id}
            >

              {branch.branch_name}

            </option>

          ))}

        </select>


        {/* Division */}

        <label>
          Division
        </label>

        <select
          value={selectedDivision}
          onChange={(e) => {

            setSelectedDivision(
              e.target.value
            );

            setStudents([]);

            setAttendance({});

          }}
          disabled={!selectedBranch}
        >

          <option value="">
            Select Division
          </option>


          {divisions.map((division) => (

            <option
              key={division.id}
              value={division.id}
            >

              Division{" "}
              {division.division_name}

            </option>

          ))}

        </select>


        <button
          className="main-button"
          onClick={handleContinue}
        >

          Continue

        </button>

      </div>


      {/* =====================================
          MARK ATTENDANCE
          ===================================== */}

      {students.length > 0 && (

        <div className="student-list">

          <h2>
            Mark Attendance
          </h2>


          {/* Date */}

          <label>
            Attendance Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />


          {/* Student Table */}

          <table>

            <thead>

              <tr>

                <th>
                  No.
                </th>

                <th>
                  Enrollment No.
                </th>

                <th>
                  Name
                </th>

                <th>
                  Attendance
                </th>

              </tr>

            </thead>


            <tbody>

              {students.map(
                (student, index) => (

                  <tr key={student.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {student.enrollment_no}
                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>

                      <button
                        className={
                          attendance[
                            student.id
                          ] === "Present"
                            ? "selected-button"
                            : ""
                        }
                        onClick={() =>
                          handleAttendanceChange(
                            student.id,
                            "Present"
                          )
                        }
                      >

                        Present

                      </button>


                      <button
                        className={
                          attendance[
                            student.id
                          ] === "Absent"
                            ? "selected-button"
                            : ""
                        }
                        onClick={() =>
                          handleAttendanceChange(
                            student.id,
                            "Absent"
                          )
                        }
                      >

                        Absent

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {/* Save */}

          <button
            className="save-button"
            onClick={saveAttendance}
          >

            Save Attendance

          </button>

        </div>

      )}


      {/* =====================================
          ATTENDANCE HISTORY
          ===================================== */}

      <div className="attendance-history">

        <h2>
          Attendance History
        </h2>


        <p className="history-text">
          Click any attendance record to view
          complete details.
        </p>


        {attendanceRecords.length === 0 && (

          <p className="no-records">

            No attendance records found.

          </p>

        )}


        {/* =================================
            ATTENDANCE CARDS
            ================================= */}

        <div className="attendance-cards">

          {attendanceRecords.map(
            (record, index) => (

              <div
                className="attendance-card"
                key={index}
                onClick={() =>
                  openAttendanceRecord(
                    record
                  )
                }
              >

                {/* Date */}

                <div className="card-date">

                  📅

                  <strong>
                    {record.attendance_date}
                  </strong>

                </div>


                {/* Branch */}

                <div className="card-info">

                  <strong>
                    Branch:
                  </strong>

                  <span>
                    {record.branch_name}
                  </span>

                </div>


                {/* Division */}

                <div className="card-info">

                  <strong>
                    Division:
                  </strong>

                  <span>
                    {record.division_name}
                  </span>

                </div>


                {/* Students */}

                <div className="card-info">

                  <strong>
                    Students:
                  </strong>

                  <span>
                    {record.total_students}
                  </span>

                </div>


                {/* Present / Absent */}

                <div className="attendance-count">

                  <span>
                    Present:
                    {" "}
                    {record.present}
                  </span>

                  <span>
                    Absent:
                    {" "}
                    {record.absent}
                  </span>

                </div>


                {/* Percentage */}

                <div className="percentage">

                  {record.percentage}%

                </div>


                <div className="view-text">

                  Click to View Details →

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* =====================================
          ATTENDANCE DETAILS
          ===================================== */}

      {selectedRecord && (

        <div className="details-box">

          <div className="details-header">

            <h2>
              Attendance Details
            </h2>

            <button
              className="close-button"
              onClick={() => {

                setSelectedRecord(null);

                setAttendanceDetails([]);

              }}
            >

              ✕ Close

            </button>

          </div>


          {/* Record Information */}

          <div className="record-summary">

            <div>

              <strong>
                Date
              </strong>

              <span>
                {selectedRecord.attendance_date}
              </span>

            </div>


            <div>

              <strong>
                Branch
              </strong>

              <span>
                {selectedRecord.branch_name}
              </span>

            </div>


            <div>

              <strong>
                Division
              </strong>

              <span>
                {selectedRecord.division_name}
              </span>

            </div>


            <div>

              <strong>
                Attendance
              </strong>

              <span>
                {selectedRecord.percentage}%
              </span>

            </div>

          </div>


          {/* Details Table */}

          {attendanceDetails.length > 0 && (

            <table>

              <thead>

                <tr>

                  <th>
                    No.
                  </th>

                  <th>
                    Enrollment No.
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {attendanceDetails.map(
                  (student, index) => (

                    <tr key={student.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {student.enrollment_no}
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td
                        className={
                          student.status ===
                          "Present"
                            ? "present-status"
                            : "absent-status"
                        }
                      >

                        {student.status}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      )}

    </div>

  );

}

export default App;
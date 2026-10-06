const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.send("Student Attendance System Backend is Running");
});


// ==========================================
// GET ALL BRANCHES
// ==========================================

app.get("/branches", (req, res) => {

    const sql = `
        SELECT *
        FROM branches
        ORDER BY id
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("Branches error:", err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ==========================================
// GET DIVISIONS OF A BRANCH
// ==========================================

app.get("/divisions/:branchId", (req, res) => {

    const branchId = req.params.branchId;

    const sql = `
        SELECT *
        FROM divisions
        WHERE branch_id = ?
        ORDER BY id
    `;

    db.query(sql, [branchId], (err, result) => {

        if (err) {
            console.log("Divisions error:", err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ==========================================
// GET STUDENTS OF A DIVISION
// ==========================================

app.get("/students/:divisionId", (req, res) => {

    const divisionId = req.params.divisionId;

    const sql = `
        SELECT *
        FROM students
        WHERE division_id = ?
        ORDER BY id
    `;

    db.query(sql, [divisionId], (err, result) => {

        if (err) {
            console.log("Students error:", err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ==========================================
// SAVE ATTENDANCE
// ==========================================

app.post("/attendance", (req, res) => {

    const {
        student_id,
        attendance_date,
        status
    } = req.body;


    if (!student_id || !attendance_date || !status) {

        return res.status(400).json({
            message: "Student ID, date and status are required"
        });

    }


    const sql = `
        INSERT INTO attendance
        (
            student_id,
            attendance_date,
            status
        )

        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE
        status = ?
    `;


    db.query(
        sql,
        [
            student_id,
            attendance_date,
            status,
            status
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Save attendance error:",
                    err
                );

                return res.status(500).json({
                    message: "Error saving attendance",
                    error: err
                });

            }


            res.json({
                message: "Attendance saved successfully"
            });

        }
    );

});


// ==========================================
// GET ALL SAVED ATTENDANCE CARDS
// ==========================================
// This gives:
// Date
// Branch
// Division
// Total students
// Present
// Absent
// Percentage
// ==========================================

app.get("/attendance-records", (req, res) => {

    const sql = `

        SELECT

            DATE_FORMAT(
                attendance.attendance_date,
                '%Y-%m-%d'
            ) AS attendance_date,

            branches.branch_name,

            divisions.division_name,

            COUNT(attendance.id) AS total_students,

            SUM(
                CASE
                    WHEN attendance.status = 'Present'
                    THEN 1
                    ELSE 0
                END
            ) AS present,

            SUM(
                CASE
                    WHEN attendance.status = 'Absent'
                    THEN 1
                    ELSE 0
                END
            ) AS absent

        FROM attendance

        INNER JOIN students
        ON attendance.student_id = students.id

        INNER JOIN divisions
        ON students.division_id = divisions.id

        INNER JOIN branches
        ON divisions.branch_id = branches.id

        GROUP BY

            attendance.attendance_date,
            branches.branch_name,
            divisions.division_name

        ORDER BY
            attendance.attendance_date DESC,
            branches.branch_name,
            divisions.division_name

    `;


    db.query(sql, (err, result) => {

        if (err) {

            console.log(
                "Attendance records error:",
                err
            );

            return res.status(500).json({
                message: "Could not get attendance records",
                error: err
            });

        }


        const records = result.map((record) => {

            const total =
                Number(record.total_students) || 0;

            const present =
                Number(record.present) || 0;

            const absent =
                Number(record.absent) || 0;


            let percentage = 0;


            if (total > 0) {

                percentage =
                    ((present / total) * 100).toFixed(2);

            }


            return {

                attendance_date:
                    record.attendance_date,

                branch_name:
                    record.branch_name,

                division_name:
                    record.division_name,

                total_students:
                    total,

                present:
                    present,

                absent:
                    absent,

                percentage:
                    percentage

            };

        });


        res.json(records);

    });

});


// ==========================================
// GET ATTENDANCE DETAILS
// ==========================================

app.get(
    "/attendance-details/:date/:divisionId",
    (req, res) => {

        const date =
            req.params.date;

        const divisionId =
            req.params.divisionId;


        const sql = `

            SELECT

                students.id,

                students.enrollment_no,

                students.name,

                DATE_FORMAT(
                    attendance.attendance_date,
                    '%Y-%m-%d'
                ) AS attendance_date,

                attendance.status

            FROM attendance

            INNER JOIN students
            ON attendance.student_id = students.id

            WHERE
                attendance.attendance_date = ?

            AND
                students.division_id = ?

            ORDER BY students.id

        `;


        db.query(
            sql,
            [
                date,
                divisionId
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Attendance details error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Could not get attendance details",
                        error: err
                    });

                }


                res.json(result);

            }
        );

    }
);


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly string _connectionString;

        public StudentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                 ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<Student?> GetStudentByIdAsync(string studentId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status 
                    FROM Students 
                    WHERE Student_ID = :studentId";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("studentId", studentId));
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Student
                            {
                                Student_ID = reader["Student_ID"]?.ToString() ?? string.Empty,
                                First_Name = reader["First_Name"]?.ToString() ?? string.Empty,
                                Middle_Name = reader["Middle_Name"]?.ToString() ?? string.Empty,
                                Last_Name = reader["Last_Name"]?.ToString() ?? string.Empty,
                                Face_Reference_Path = reader["Face_Reference_Path"]?.ToString() ?? string.Empty,
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"]?.ToString() ?? "Regular" : "Regular"
                            };
                        }
                        return null; 
                    }
                }
            }
        }

        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            var students = new List<Student>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status 
                    FROM Students
                    ORDER BY Last_Name ASC";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            students.Add(new Student
                            {
                                Student_ID = reader["Student_ID"]?.ToString() ?? string.Empty,
                                First_Name = reader["First_Name"]?.ToString() ?? string.Empty,
                                Middle_Name = reader["Middle_Name"]?.ToString() ?? string.Empty,
                                Last_Name = reader["Last_Name"]?.ToString() ?? string.Empty,
                                Face_Reference_Path = reader["Face_Reference_Path"]?.ToString() ?? string.Empty,
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"]?.ToString() ?? "Regular" : "Regular"
                            });
                        }
                    }
                }
            }
            return students;
        }

        // --- NEW: FETCH THE LATEST ID FOR AUTO-INCREMENT ---
        public async Task<string?> GetLatestStudentIdAsync(string yearPrefix)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT MAX(Student_ID) FROM Students WHERE Student_ID LIKE :prefix";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("prefix", yearPrefix + "-%"));
                    await con.OpenAsync();
                    var result = await cmd.ExecuteScalarAsync();
                    return result != DBNull.Value ? result?.ToString() : null;
                }
            }
        }

        public async Task CreateStudentAsync(Student student)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    INSERT INTO Students (Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status) 
                    VALUES (:id, :fname, :mname, :lname, :facepath, :status)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", student.Student_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", student.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(student.Middle_Name) ? DBNull.Value : student.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", student.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("facepath", student.Face_Reference_Path));
                    cmd.Parameters.Add(new OracleParameter("status", string.IsNullOrEmpty(student.Enrollment_Status) ? "Regular" : student.Enrollment_Status));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateStudentAsync(Student student)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    UPDATE Students 
                    SET First_Name = :fname, 
                        Middle_Name = :mname, 
                        Last_Name = :lname, 
                        Face_Reference_Path = :facepath, 
                        Enrollment_Status = :status
                    WHERE Student_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", student.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(student.Middle_Name) ? DBNull.Value : student.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", student.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("facepath", student.Face_Reference_Path));
                    cmd.Parameters.Add(new OracleParameter("status", string.IsNullOrEmpty(student.Enrollment_Status) ? "Regular" : student.Enrollment_Status));
                    cmd.Parameters.Add(new OracleParameter("id", student.Student_ID));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        // --- THE FIX: SOFT DELETE ---
        public async Task DeleteStudentAsync(string studentId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // We do NOT DELETE. We simply change the status to 'Dropped' so records remain intact.
                string sql = "UPDATE Students SET Enrollment_Status = 'Dropped' WHERE Student_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", studentId));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
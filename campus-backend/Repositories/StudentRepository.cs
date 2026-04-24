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

        // --- 1. GET STUDENT BY ID ---
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
                                Student_ID = reader["Student_ID"].ToString(),
                                First_Name = reader["First_Name"].ToString(),
                                Middle_Name = reader["Middle_Name"].ToString(),
                                Last_Name = reader["Last_Name"].ToString(),
                                Face_Reference_Path = reader["Face_Reference_Path"].ToString(),
                                // Ensure we handle potentially null DB values gracefully
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"].ToString() : "Regular"
                            };
                        }
                        
                        return null; 
                    }
                }
            }
        }

        // --- 2. GET ALL STUDENTS ---
        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            var students = new List<Student>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status 
                    FROM Students";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            students.Add(new Student
                            {
                                Student_ID = reader["Student_ID"].ToString(),
                                First_Name = reader["First_Name"].ToString(),
                                Middle_Name = reader["Middle_Name"].ToString(),
                                Last_Name = reader["Last_Name"].ToString(),
                                Face_Reference_Path = reader["Face_Reference_Path"].ToString(),
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"].ToString() : "Regular"
                            });
                        }
                    }
                }
            }
            return students;
        }

        // --- 3. CREATE NEW STUDENT ---
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
                    
                    // Handle nullable middle name
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(student.Middle_Name) ? DBNull.Value : student.Middle_Name));
                    
                    cmd.Parameters.Add(new OracleParameter("lname", student.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("facepath", student.Face_Reference_Path));
                    
                    // Add the new status parameter (default to Regular if somehow null)
                    cmd.Parameters.Add(new OracleParameter("status", string.IsNullOrEmpty(student.Enrollment_Status) ? "Regular" : student.Enrollment_Status));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
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
                // THE FIX: Added the 3 new columns to the SELECT query
                string sql = @"
                    SELECT Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status,
                           Contact_Number, Birthday, Address
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
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"]?.ToString() ?? "Regular" : "Regular",
                                // THE FIX: Map the database columns to the C# Model
                                Contact_Number = reader["Contact_Number"]?.ToString(),
                                Birthday = reader["Birthday"]?.ToString(),
                                Address = reader["Address"]?.ToString()
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
                // THE FIX: Added the 3 new columns to the SELECT query
                string sql = @"
                    SELECT Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status,
                           Contact_Number, Birthday, Address
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
                                Enrollment_Status = reader["Enrollment_Status"] != DBNull.Value ? reader["Enrollment_Status"]?.ToString() ?? "Regular" : "Regular",
                                // THE FIX: Map the database columns to the C# Model
                                Contact_Number = reader["Contact_Number"]?.ToString(),
                                Birthday = reader["Birthday"]?.ToString(),
                                Address = reader["Address"]?.ToString()
                            });
                        }
                    }
                }
            }
            return students;
        }

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
                // THE FIX: Added the 3 new columns to the INSERT statement
                string sql = @"
                    INSERT INTO Students (Student_ID, First_Name, Middle_Name, Last_Name, Face_Reference_Path, Enrollment_Status, Contact_Number, Birthday, Address) 
                    VALUES (:id, :fname, :mname, :lname, :facepath, :status, :contact, :bday, :address)";
                    
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", student.Student_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", student.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(student.Middle_Name) ? DBNull.Value : student.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", student.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("facepath", student.Face_Reference_Path));
                    cmd.Parameters.Add(new OracleParameter("status", string.IsNullOrEmpty(student.Enrollment_Status) ? "Regular" : student.Enrollment_Status));
                    
                    // THE FIX: Add the new parameters, handling nulls gracefully for Oracle
                    cmd.Parameters.Add(new OracleParameter("contact", string.IsNullOrEmpty(student.Contact_Number) ? DBNull.Value : student.Contact_Number));
                    cmd.Parameters.Add(new OracleParameter("bday", string.IsNullOrEmpty(student.Birthday) ? DBNull.Value : student.Birthday));
                    cmd.Parameters.Add(new OracleParameter("address", string.IsNullOrEmpty(student.Address) ? DBNull.Value : student.Address));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateStudentAsync(Student student)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // THE FIX: Added the 3 new columns to the UPDATE statement
                string sql = @"
                    UPDATE Students 
                    SET First_Name = :fname, 
                        Middle_Name = :mname, 
                        Last_Name = :lname, 
                        Face_Reference_Path = :facepath, 
                        Enrollment_Status = :status,
                        Contact_Number = :contact,
                        Birthday = :bday,
                        Address = :address
                    WHERE Student_ID = :id";
                    
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", student.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(student.Middle_Name) ? DBNull.Value : student.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", student.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("facepath", student.Face_Reference_Path));
                    cmd.Parameters.Add(new OracleParameter("status", string.IsNullOrEmpty(student.Enrollment_Status) ? "Regular" : student.Enrollment_Status));
                    
                    // THE FIX: Add the new parameters
                    cmd.Parameters.Add(new OracleParameter("contact", string.IsNullOrEmpty(student.Contact_Number) ? DBNull.Value : student.Contact_Number));
                    cmd.Parameters.Add(new OracleParameter("bday", string.IsNullOrEmpty(student.Birthday) ? DBNull.Value : student.Birthday));
                    cmd.Parameters.Add(new OracleParameter("address", string.IsNullOrEmpty(student.Address) ? DBNull.Value : student.Address));
                    
                    // The WHERE clause parameter MUST be last
                    cmd.Parameters.Add(new OracleParameter("id", student.Student_ID));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteStudentAsync(string studentId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
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
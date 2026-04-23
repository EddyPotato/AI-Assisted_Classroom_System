using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly string _connectionString;

        // This injects your OracleConnection string from appsettings.json
        public StudentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<Student?> GetStudentByBarcodeAsync(string barcodeData)
        {
            // USING block ensures the database connection closes automatically, even if it crashes
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // This is your raw, bare-metal Oracle SQL query
                // Notice the :barcode parameter? That protects your database from SQL injection!
                string sql = @"
                    SELECT Student_ID, Full_Name, Barcode_Data, Face_Reference_Path 
                    FROM Students 
                    WHERE Barcode_Data = :barcode";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    // Bind the C# variable to the Oracle SQL parameter safely
                    cmd.Parameters.Add(new OracleParameter("barcode", barcodeData));

                    await con.OpenAsync();

                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Student
                            {
                                Student_ID = reader["Student_ID"].ToString(),
                                Full_Name = reader["Full_Name"].ToString(),
                                Barcode_Data = reader["Barcode_Data"].ToString(),
                                Face_Reference_Path = reader["Face_Reference_Path"].ToString()
                            };
                        }
                        
                        // Return null if no student matches that barcode
                        return null; 
                    }
                }
            }
        }
    }
}
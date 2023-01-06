using System;
using System.IO;

namespace ProcessView
{
    /// <summary>
    /// Rov positional data convertion (etr file format).
    /// </summary>
    public class RovTelemetry
    {
        private static readonly int maxRecords = 332000;

        public double[] Positions = new double[maxRecords * 3];
        public DateTime[] Times = new DateTime[maxRecords];
        public double[] Rolls = new double[maxRecords];
        public double[] Pitches = new double[maxRecords];
        public double[] Headings = new double[maxRecords];

        /// <summary>
        /// Loads in ROV telemetry data and converts it for client rendering.
        /// </summary>
        public void ProcessEtr()
        {
            using StreamReader streamReader = new("Data/telemetry.etr");

            string line;
            string[] split;
            string[] date;

            int count = 0;

            line = streamReader.ReadLine(); // skip header line
            line = streamReader.ReadLine(); // first record
            split = line.Split(' ');

            float eastingOrigin = (float)Convert.ToDouble(split[2]);
            float northingOrigin = (float)Convert.ToDouble(split[3]);

            // Read file
            while ((line = streamReader.ReadLine()) != null && count < maxRecords)
            //while ((line = streamReader.ReadLine()) != null)
            {
                if (line == "")
                {
                    continue;
                }

                split = line.Split(' ');

                // Date time
                date = split[0].Split('-');
                Times[count] = Convert.ToDateTime($"{date[2]}-{date[1]}-{date[0]} {split[1]}");

                // Easting, northing and water depth to Vector3
                Positions[count * 3] = eastingOrigin - Convert.ToDouble(split[2]);
                Positions[(count * 3) + 1] = -Convert.ToDouble(split[4]);
                Positions[(count * 3) + 2] = northingOrigin - Convert.ToDouble(split[3]);

                Rolls[count] = Convert.ToDouble(split[5]);
                Pitches[count] = Convert.ToDouble(split[6]);
                Headings[count] = Convert.ToDouble(split[7]);

                count++;
            }
        }
    }
}
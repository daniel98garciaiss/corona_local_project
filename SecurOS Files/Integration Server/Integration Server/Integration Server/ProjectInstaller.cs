using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Integration_Server
{
    [RunInstaller(true)]
    public partial class ProjectInstaller : System.Configuration.Install.Installer
    {
        public ProjectInstaller()
        {
            InitializeComponent();
        }

        protected override void OnAfterInstall(IDictionary savedState)
        {
            string Message =
                                         "\nGENERIC_DOOR = GENERIC_DOOR.png" +
                                         "\nGENERIC_INPUT = GENERIC_INPUT.png" +
                                         "\nGENERIC_OUTPUT = GENERIC_OUTPUT.png" +
                                         "\nGENERIC_RELAY = GENERIC_RELAY.png" +
                                         "\nGENERIC_SENSOR = GENERIC_SENSOR.png" +
                                         "\nGENERIC_LIGHT = GENERIC_LIGHT.png" +
                                         "\nGENERIC_SMOKE = GENERIC_SMOKE.png" +
                                         "\nGENERIC_FIRE = GENERIC_FIRE.png" +
                                         "\nGENERIC_INTRU = GENERIC_INTRU.png" +
                                         "\nGENERIC_AREA = GENERIC_AREA.png" +
                                         "\nGENERIC_DOOR_MO = GENERIC_DOOR_MO.png" +
                                         "\nGENERIC_INPUT_MO = GENERIC_INPUT_MO.png" +
                                         "\nGENERIC_OUT_MO = GENERIC_OUT_MO.png" +
                                         "\nGENERIC_RELAY_MO = GENERIC_RELAY_MO.png" +
                                         "\nGENERIC_LIGHT_MO = GENERIC_LIGHT_MO.png" +
                                         "\nGENERIC_SEN_MO = GENERIC_SEN_MO.png" +
                                         "\nGENERIC_SMOKE_MO = GENERIC_SMOKE_MO.png" +
                                         "\nGENERIC_FIRE_MO = GENERIC_FIRE_MO.png" +
                                         "\nGENERIC_INTRU_MO = GENERIC_INTRU_MO.png" +
                                         "\nGENERIC_AREA_MO = GENERIC_AREA_MO.png" +
                                         "\nRECEIVER = RECEIVER.png" +
                                         "\nPANEL = PANEL.png" +
                                         "\nPARTITION = PARTITION.png" +
                                         "\nSENSOR = SENSOR.png"
                                         ;

            string path = "C:\\Program Files (x86)\\ISS\\SecurOS\\Modules\\map";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            string filepath = "C:\\Program Files (x86)\\ISS\\SecurOS\\Modules\\map\\Map" + ".ini";
            if (!File.Exists(filepath))
            {
                // Create a file to write to.   
                using (StreamWriter sw = File.CreateText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
            else
            {
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
        }
        private void serviceProcessInstaller1_AfterInstall(object sender, InstallEventArgs e)
        {

        }

        private void serviceInstaller1_AfterInstall(object sender, InstallEventArgs e)
        {

        }
    }
}

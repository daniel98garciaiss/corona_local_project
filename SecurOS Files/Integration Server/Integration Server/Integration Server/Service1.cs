using LogsCol;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Collections.Specialized;
using System.Text;
using System.Threading.Tasks;

namespace Integration_Server
{
    public partial class Service1 : ServiceBase
    {
        public MainProgram Main = new MainProgram();
        private NameValueCollection _appSettings;
        public string Logs_Name = "IntegrationServer";
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            try
            {
 
                Log.Write("The service has started", "INFO", Logs_Name);

                _appSettings = System.Configuration.ConfigurationManager.AppSettings;
                if (_appSettings != null && _appSettings.Count > 0)
                {
                    foreach (var key in _appSettings.AllKeys)
                    {
                        if (!key.Equals("LaunchDebugger")) continue;
                        if (_appSettings[key].Equals("1"))
                            Debugger.Launch();
                    }
                }
                Main.Main();

            }
            catch (Exception e)
            {
                Log.Write("Error Starting Integration Service...  " + e.Message, "ERROR", Logs_Name);
            }
        }

        protected override void OnStop()
        {
        }
    }
}

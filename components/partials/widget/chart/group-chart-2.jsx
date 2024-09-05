"use client"
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const shapeLine1 = {
  series: [
    {
      data: [800, 600, 1000, 800, 600, 1000, 800, 900],
    },
  ],
  options: {
    chart: {
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#00EBFF"],
    tooltip: {
      theme: "light",
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [0.1],
    },
    legend: {
      show: false,
    },
    xaxis: {
      low: 0,
      offsetX: 0,
      offsetY: 0,
      show: false,
      labels: {
        low: 0,
        offsetX: 0,
        show: false,
      },
      axisBorder: {
        low: 0,
        offsetX: 0,
        show: false,
      },
    },
  },
};
const shapeLine2 = {
  series: [
    {
      data: [800, 600, 1000, 800, 600, 1000, 800, 900],
    },
  ],
  options: {
    chart: {
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#FB8F65"],
    tooltip: {
      theme: "light",
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [0.1],
    },
    legend: {
      show: false,
    },
    xaxis: {
      low: 0,
      offsetX: 0,
      offsetY: 0,
      show: false,
      labels: {
        low: 0,
        offsetX: 0,
        show: false,
      },
      axisBorder: {
        low: 0,
        offsetX: 0,
        show: false,
      },
    },
  },
};
const shapeLine3 = {
  series: [
    {
      data: [800, 600, 1000, 800, 600, 1000, 800, 900],
    },
  ],
  options: {
    chart: {
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#5743BE"],
    tooltip: {
      theme: "light",
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [0.1],
    },
    legend: {
      show: false,
    },
    xaxis: {
      low: 0,
      offsetX: 0,
      offsetY: 0,
      show: false,
      labels: {
        low: 0,
        offsetX: 0,
        show: false,
      },
      axisBorder: {
        low: 0,
        offsetX: 0,
        show: false,
      },
    },
  },
};


const shapeLine4 = {
  series: [
    {
      data: [800, 600, 1000, 800, 600, 1000, 800, 900],
    },
  ],
  options: {
    chart: {
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#5743BE"],
    tooltip: {
      theme: "light",
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [0.1],
    },
    legend: {
      show: false,
    },
    xaxis: {
      low: 0,
      offsetX: 0,
      offsetY: 0,
      show: false,
      labels: {
        low: 0,
        offsetX: 0,
        show: false,
      },
      axisBorder: {
        low: 0,
        offsetX: 0,
        show: false,
      },
    },
  },
};


const statistics = [
  {
    name: shapeLine1,
    title: "Amount <br> Invested",
    count: "3,564",
    bg: "bg-[#E5F9FF] dark:bg-slate-900	",
    text: "text-info-500",
    icon: "heroicons:shopping-cart",
  },
  {
    name: shapeLine2,
    title: "Shareholding <br> Percentage",
    count: "15%",
    bg: "bg-[#FFEDE6] dark:bg-slate-900	",
    text: "text-warning-500",
    icon: "heroicons:cube",
  },
  {
    name: shapeLine3,
    title: "Nominee <br> Director",
    count: "Sahil Chopra",
    bg: "bg-[#EAE6FF] dark:bg-slate-900	",
    text: "text-[#5743BE]",
    icon: "heroicons:arrow-trending-up-solid",
  },
  {
    name: shapeLine4,
    title: "Key <br> Insights",
    count: "<br>",
    bg: "bg-[#FFEAEA] dark:bg-[#3B0D0C]", // Light green for light mode, dark slate for dark mode
    text: "text-[#256029]", // Dark green text for better contrast
    icon: "heroicons:plus", // Represents insights or ideas
  }
];

const GroupChart2 = () => {
  return (
    <>
      {statistics.map((item, i) => (
        <div key={i}>
          <Card bodyClass="pt-4 pb-3 px-4 h-full pt-8 pb-4">
            <div className="flex space-x-3 rtl:space-x-reverse">
              <div className="flex-none align-center">
                <div
                  className={`${item.bg} ${item.text} h-12 w-12 rounded-full flex flex-col items-center justify-center text-2xl`}
                >
                  <Icon icon={item.icon} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-medium" dangerouslySetInnerHTML={{ __html: item.title }}>
                  
                </div>
                <div className="text-slate-900 dark:text-white text-sm font-semibold" dangerouslySetInnerHTML={{ __html: item.count }}>
                  
                </div>
              </div>
            </div>
            <div className="ltr:ml-auto rtl:mr-auto max-w-[124px]">
              {/* <Chart
                options={item.name.options}
                series={item.name.series}
                type="area"
                height="41"
                width="124"
              /> */}
            </div>
          </Card>
        </div>
      ))}
    </>
  );
};

export default GroupChart2;

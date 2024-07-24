"use client";
import Icon from "@/components/ui/Icon";

const statistics = [
  {
    title: "Total Startups",
    count: "20",
    bg: "bg-warning-500",
    text: "text-primary-500",
    percent: "10.00%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-1.png",
    percentClass: "text-primary-500",
  },
  {
    title: "Curated Startups",
    count: "15",
    bg: "bg-info-500",
    text: "text-primary-500",
    percent: "7.50%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-2.png",
    percentClass: "text-primary-500",
  },
  {
    title: "Open Conversations",
    count: "10",
    bg: "bg-success-500",
    text: "text-primary-500",
    percent: "5.00%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-3.png",
    percentClass: "text-primary-500",
  },
  {
    title: "Closed Transactions",
    count: "5",
    bg: "bg-danger-500",
    text: "text-primary-500",
    percent: "2.50%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-4.png",
    percentClass: "text-primary-500",
  },
];

const GroupChartNew3 = () => {
  return (
    <>
      {statistics.map((item, i) => (
        <div
          key={i}
          className={`${item.bg} rounded-md p-4 bg-opacity-[0.15] dark:bg-opacity-25 relative z-[1]`}
        >
          <div className="overlay absolute left-0 top-0 w-full h-full z-[-1]">
            <img
              src={item.img}
              alt=""
              draggable="false"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="block mb-6 text-sm text-slate-900 dark:text-white font-medium">
            <h7>
              <b>{item.title}</b>
            </h7>
          </span>
          <span className="block text-2xl text-slate-900 dark:text-white font-medium mb-6">
            {item.count}
          </span>
        </div>
      ))}
    </>
  );
};

export default GroupChartNew3;

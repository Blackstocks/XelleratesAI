"use client";
import Icon from "@/components/ui/Icon";

const statistics = [
  {
    title: "Investors available for your startup",
    count: "10",
    bg: "bg-warning-500",
    text: "text-primary-500",
    percent: "5.00%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-1.png",
    percentClass: "text-primary-500",
  },
  {
    title: "Investors reached out",
    count: "5",
    bg: "bg-info-500",
    text: "text-primary-500",
    percent: "2.50%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-2.png",
    percentClass: "text-primary-500",
  },
  {
    title: "Interest from Investors",
    count: "8",
    bg: "bg-success-500",
    text: "text-primary-500",
    percent: "4.00%",
    icon: "heroicons:arrow-trending-up",
    img: "/assets/images/all-img/shade-3.png",
    percentClass: "text-primary-500",
  },
];

const GroupChart3 = () => {
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
            {item.title}
          </span>
          <span className="block text-2xl text-slate-900 dark:text-white font-medium mb-6">
            {item.count}
          </span>
        </div>
      ))}
    </>
  );
};

export default GroupChart3;

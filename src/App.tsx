import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Card,
  CardBody,
  Typography,
  CardFooter,
  Button,
  IconButton,
} from "@material-tailwind/react";
import FETCH_HEADERS from "./constant";
import { filesize } from "filesize";

import names from "./data/name.json";
import pages from "./data/pages.json";
import sizes from "./data/sizes.json";

function App() {
  const [open, setOpen] = useState("jm1");
  const [data, setData] = useState([]);

  const handleOpen = (value: string) => {
    setOpen(open === value ? "" : value);
  };

  const customAnimation = {
    mount: { scale: 1 },
    unmount: { scale: 0.9 },
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setData([]);
      }, 500);
    }
    if (open) {
      fetch(
        `https://api.github.com/repos/melvinchia3636/textbooks/contents/${open}?ref=main`,
        FETCH_HEADERS
      )
        .then((res) => res.json())
        .then((res) => setData(res));
    }
  }, [open]);

  return (
    <main className="w-full min-h-screen font-['MiSans'] py-32 px-24 flex flex-col items-center relative">
      <Typography variant="h2" color="orange" textGradient>
        马来西亚华文独中课本电子书库
      </Typography>
      <Typography
        variant="p"
        className="mt-2 font-normal mb-8 text-blue-gray-400"
      >
        本网站由学生自主开发及维护，旨在为独中生提供免费的电子书资源
      </Typography>
      {["jm1", "jm2", "jm3", "sm1", "sm2", "sm3"].map((grade) => (
        <Accordion open={open === grade} animate={customAnimation}>
          <AccordionHeader
            onClick={() => handleOpen(grade)}
            className="accordion-header"
          >
            <h2>
              {
                {
                  jm1: "初一",
                  jm2: "初二",
                  jm3: "初三",
                  sm1: "高一",
                  sm2: "高二",
                  sm3: "高三",
                }[grade]
              }{" "}
              {
                {
                  jm1: "Junior 1",
                  jm2: "Junior 2",
                  jm3: "Junior 3",
                  sm1: "Senior 1",
                  sm2: "Senior 2",
                  sm3: "Senior 3",
                }[grade]
              }
            </h2>
          </AccordionHeader>
          {data.length ? (
            <AccordionBody>
              <div className="grid grid-cols-4 gap-8">
                {data
                  .filter((e: any) => e.name.endsWith(".pdf"))
                  .map((e: any) => (
                    <Card className="p-3 pb-0 items-center" key={e.sha}>
                      <div>
                        <img
                          src={`https://github.com/melvinchia3636/textbooks/raw/main/images/${
                            e.path.split("/")[0]
                          }/${e.name.split(".")[0]}.jpg`}
                          alt=""
                          className="object-contain mt-3 h-64 rounded-lg overflow-hidden"
                        />
                      </div>
                      <CardBody className="text-center flex-1">
                        <Typography variant="h5">
                          {(open &&
                            (names as any)[e.path.split("/")[0]][
                              e.name.split(".")[0]
                            ]) ||
                            e.name.split(".")[0]}
                        </Typography>
                      </CardBody>
                      <Button
                        onClick={() => window.open(e.download_url)}
                        fullWidth
                        size="lg"
                        className="mb-4 bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:shadow-orange-300"
                      >
                        下载
                      </Button>
                      <CardFooter
                        divider
                        className="flex items-center justify-between py-3 w-full px-2 mt-2"
                      >
                        <Typography variant="small" className="font-normal">
                          {(open &&
                            (pages as any)[e.path.split("/")[0]][
                              e.name.split(".")[0]
                            ]) ||
                            0}{" "}
                          页
                        </Typography>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          {filesize(
                            (open &&
                              (sizes as any)[e.path.split("/")[0]][
                                e.name.split(".")[0]
                              ]) ||
                              0
                          )}
                        </Typography>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </AccordionBody>
          ) : (
            ""
          )}
        </Accordion>
      ))}
      <footer className="mt-8 absolute bottom-4 left-1/2 -translate-x-1/2">
        <Typography
          variant="paragraph"
          className="text-blue-gray-300 font-normal text-sm"
        >
          本网站提供之所有资源，仅供学习交流使用，不得用于商业用途。
        </Typography>
      </footer>
    </main>
  );
}

export default App;

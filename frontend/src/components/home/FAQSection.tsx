
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  Plus,
  Minus,
  MessageCircleQuestion,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import theme from "@/theme";

const faqs = [
  {
    question: "What is EduLearn?",
    answer:
      "EduLearn is an online learning platform where you can explore courses, develop practical skills, and learn from structured lessons at your own pace.",
  },
  {
    question: "How do I enroll in a course?",
    answer:
      "Browse our courses, select the course you want to learn, and follow the enrollment instructions on its details page. Create an account if required.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Yes. Our learning experience is designed to give you flexibility. You can study according to your schedule and revisit available learning materials whenever you need.",
  },
  {
    question: "Do I receive a certificate after completing a course?",
    answer:
      "Certificate availability depends on the individual course. Check the course details to see whether a certificate is included and what completion requirements apply.",
  },
  {
    question: "Are the courses suitable for beginners?",
    answer:
      "Yes. You can explore beginner-friendly courses and gradually progress to more advanced topics. Review the prerequisites listed on each course page before enrolling.",
  },
  {
    question: "How can I get help if I have a problem?",
    answer:
      "Visit our contact page to reach the support team. Include details about your question or technical issue so the team can help you more effectively.",
  },
];

export default function FAQSection() {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box
      component="section"
      id="faq"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: theme.palette.background.default,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "0.85fr 1.15fr",
            },
            gap: { xs: 4, md: 8 },
            alignItems: "start",
          }}
        >
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.8,
                borderRadius: 10,
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.primary.main,
                mb: 2.5,
              }}
            >
              <MessageCircleQuestion size={16} />
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                HAVE QUESTIONS?
              </Typography>
            </Box>

            <Typography
              component="h2"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: { xs: 30, sm: 38, md: 44 },
                lineHeight: 1.2,
                letterSpacing: "-0.04em",
                mb: 2,
              }}
            >
              Frequently asked
              <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                {" "}questions
              </Box>
            </Typography>

            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 15,
                lineHeight: 1.9,
                maxWidth: 400,
                mb: 3,
              }}
            >
              Find answers to common questions about courses, enrollment,
              certificates, and your learning journey.
            </Typography>

            <Box
              sx={{
                p: 2.5,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                mb: 3,
                maxWidth: 390,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Sparkles size={18} color={theme.palette.secondary.main} />
                <Typography
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Still need help?
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 13,
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Our team can help you find the right learning path.
              </Typography>

              <Button
                component="a"
                href="/contact"
                endIcon={<ArrowRight size={17} />}
                sx={{
                  p: 0,
                  textTransform: "none",
                  color: theme.palette.secondary.dark,
                  fontWeight: 700,
                  fontSize: 13,
                  "&:hover": {
                    bgcolor: "transparent",
                    gap: 0.5,
                  },
                }}
              >
                Contact Support
              </Button>
            </Box>
          </motion.div>

          {/* Right FAQ list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {faqs.map((faq, index) => {
              const isExpanded = expanded === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -2 }}
                >
                  <Accordion
                    expanded={isExpanded}
                    onChange={(_, isOpen) =>
                      setExpanded(isOpen ? index : false)
                    }
                    disableGutters
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: isExpanded ? theme.palette.secondary.light : theme.palette.divider,
                      borderRadius: "14px !important",
                      bgcolor: theme.palette.background.paper,
                      overflow: "hidden",
                      transition: "border-color 0.25s ease",
                      "&:before": { display: "none" },
                      "&:hover": { borderColor: theme.palette.secondary.light },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            background: isExpanded ? theme.palette.primary.main : theme.palette.background.default,
                            color: isExpanded ? theme.palette.primary.contrastText : theme.palette.primary.main,
                          }}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={isExpanded ? "minus" : "plus"}
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.15 }}
                              style={{ display: "flex" }}
                            >
                              {isExpanded ? (
                                <Minus size={16} />
                              ) : (
                                <Plus size={16} />
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      }
                      sx={{
                        px: { xs: 2, md: 2.5 },
                        py: 1,
                        minHeight: 65,
                        "& .MuiAccordionSummary-content": {
                          my: 1.5,
                          mr: 1.5,
                        },
                        "& .MuiAccordionSummary-expandIconWrapper": {
                          transform: "none !important",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color: isExpanded ? theme.palette.primary.main : theme.palette.text.primary,
                          fontWeight: 700,
                          fontSize: { xs: 13, sm: 14 },
                          lineHeight: 1.6,
                          transition: "color 0.2s ease",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1.5,
                            fontSize: 12,
                            fontFamily: "monospace",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Box>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        px: { xs: 2, md: 2.5 },
                        pt: 0,
                        pb: 2.5,
                      }}
                    >
                      <Typography
                        sx={{
                          pl: { xs: 0, sm: 4 },
                          color: theme.palette.text.secondary,
                          fontSize: 13,
                          lineHeight: 1.9,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export type NewsItem = {
  id: string;
  dateLabel: string;
  title: string;
  preview: string;
  article: string[];
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'leadership-lab',
    dateLabel: 'Mar 4',
    title: 'State Leadership Lab Registration Opens',
    preview: 'Chapters can now register delegates for the April leadership lab sessions.',
    article: [
      'State leadership lab registration is now open for all active chapters.',
      'This year includes focused tracks for chapter officer teams, project leads, and first-year members who want practical leadership tools.',
      'Advisers should submit final attendee counts before March 22 to lock in workshop placements and meal planning.',
      'A digital packet with schedules, room assignments, and check-in details will be sent to registered advisers one week before the event.',
    ],
  },
  {
    id: 'competitive-events',
    dateLabel: 'Mar 1',
    title: 'Competitive Event Rubrics Updated',
    preview: 'Updated scoring rubrics are now posted for presentation and interview events.',
    article: [
      'The competitive events team has released updated rubrics for selected speaking, presentation, and interview categories.',
      'Changes focus on clearer scoring language and more consistent weighting between content accuracy and delivery quality.',
      'Students should review the updated criteria with advisers before final practice runs so their preparation matches judging expectations.',
      'The revised rubric set is effective for all spring qualifying rounds.',
    ],
  },
  {
    id: 'service-challenge',
    dateLabel: 'Feb 27',
    title: 'Chapter Service Challenge Announced',
    preview: 'A new service challenge invites chapters to log impact projects through May.',
    article: [
      'FBLA has announced a chapter service challenge running from March through May.',
      'Participating chapters can track volunteer hours, project outcomes, and community partnerships through the chapter reporting portal.',
      'Recognition categories include total impact, innovative service design, and strongest community collaboration.',
      'Final submissions are due May 31, and highlighted chapters will be featured during the summer leadership update.',
    ],
  },
  {
    id: 'member-toolkit',
    dateLabel: 'Feb 24',
    title: 'New Member Recruitment Toolkit Released',
    preview: 'A ready-to-use toolkit includes slide decks, flyers, and outreach templates.',
    article: [
      'A new member recruitment toolkit is now available for chapters preparing spring and fall outreach campaigns.',
      'The toolkit includes editable presentation slides, poster templates, classroom announcement scripts, and social media copy.',
      'Advisers can customize materials with local chapter branding while keeping consistent national messaging.',
      'The toolkit also includes a short planning checklist to help chapters coordinate outreach timelines and follow-up events.',
    ],
  },
  {
    id: 'advisor-webinar',
    dateLabel: 'Feb 20',
    title: 'Advisor Webinar Series Adds Finance Session',
    preview: "Next month's advisor webinar will cover budgeting, dues tracking, and event costs.",
    article: [
      'The advisor webinar series has added a finance operations session for chapter advisers and officer teams.',
      'Topics include annual budgeting, dues tracking workflows, and practical approaches for reducing student event costs.',
      'Attendees will receive a planning worksheet and a sample budget model that can be adapted to chapter size.',
      'Live Q and A will follow the presentation, with a recording posted for chapters unable to attend.',
    ],
  },
];

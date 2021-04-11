import * as React from 'react';
import { graphql } from "gatsby";
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Layout from '../components/Layout';
import PublicationsTable from '../components/PublicationsTable';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import parse from 'html-react-parser';

export default function Index({ data }) {
  const siteMetadata = data.site.siteMetadata
  console.log(siteMetadata)

  const thumbnails = new Map()
  data.allFile.edges.forEach((f) => {
    const pub = parseInt(f.node.relativePath.split('/')[0])
    thumbnails.set(pub, f.node.childImageSharp)
  })
  const targetJournal = data.site.siteMetadata.targetJournal
  const targetPubs = data.allJson.edges.filter((pub) => {
    if (pub.node.publication) {
      return pub.node.publication.journals.filter((p) => p.journal_id === targetJournal).length > 0
    }
    return false
  })
  const rows = targetPubs.map((pub) => {
    const publication = pub.node.publication
    const thumbnail = thumbnails.has(publication.publication_id) ? thumbnails.get(publication.publication_id).gatsbyImageData: null
    const row = { id: publication.publication_id,
      title: publication.title,
      authors: publication.authors.map(a => a.author_fullname).join(", "),
      keywords: publication.tags.join(", "),
      thumbnail,
    }
    return row
  }).reverse()
  return (
    <StyledEngineProvider injectFirst>
      <Layout>
        <Container maxWidth="lg">
	  <Accordion>
	    <AccordionSummary
	      expandIcon={<ExpandMoreIcon />}
	    >
	      <Typography>{parse(siteMetadata.description)}</Typography>
	    </AccordionSummary>
	    <AccordionDetails>
	      <Typography>{parse(siteMetadata.extendedDescription)}</Typography>
	    </AccordionDetails>
	  </Accordion>
          <Box sx={{ my: 2 }}>
            <PublicationsTable rows={rows} />
          </Box>
        </Container>
      </Layout>
    </StyledEngineProvider>
  );
}

export const query = graphql`
  query IndexQuery {
    allJson {
      edges {
        node {
          publication {
            title
            authors {
              author_fullname
            }
            publication_id
            tags
            journals {
              journal_id
            }
          }
          issue {
            issue_id
            name
            publications
            short_description
            introductory_text
          }
        }
      }
    }
    allFile(filter: {relativePath: {glob: "*/thumbnail.jpeg"}}) {
      edges {
        node {
          childImageSharp {
            gatsbyImageData
          }
          relativePath
        }
      }
    }
    site {
      siteMetadata {
        targetJournal
        description
        extendedDescription
      }
    }
}
`;

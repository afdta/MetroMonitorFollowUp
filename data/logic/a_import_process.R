#Notes about data:Inflation adjustment? Not necessary for index, but useful for display

#IMPORT
tryCatch(
  {
    setwd("/home/alec/Projects/metro-index/data/")
    cat("Working directory set to: /home/alec/Projects/metro-index/data/ \n")  
  },
  warning = function(w){print(w)},
  error = function(e){
    setwd("/home/alec/Projects/Brookings/DataViz/metro-index/data/")
    cat("Working directory set to: /home/alec/Projects/Brookings/DataViz/metro-index/data/ \n")
  },
  finally={
    #nothing to do
  }
)

nastr <- c("na","N/A","NA","")

GrChg <- read.csv("Growth Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrRnk <- read.csv("Growth Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrVal <- read.csv("Growth Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncRaceChg <- read.csv("Inclusion by Race MAD Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceRnk <- read.csv("Inclusion by Race MAD Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceVal <- read.csv("Inclusion by Race MAD Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncChg <- read.csv("Inclusion Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRnk <- read.csv("Inclusion Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncVal <- read.csv("Inclusion Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProChg <- read.csv("Prosperity Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProRnk <- read.csv("Prosperity Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProVal <- read.csv("Prosperity Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProIdx <- read.csv("Prosperity Index.csv", stringsAsFactors=FALSE, na.strings=nastr)

listIndicators <- function(...){
  args <- list(...)

  for(i in args){
    cat("==================================================================================\n")
    nm <- names(i)
    if("indicator" %in% nm){
      cat("Indicators:\n")
      print(table(i$indicator))
    } else if("Indicator" %in% nm){
      cat("Indicators:\n")
      print(table(i$Indicator))
    }else{
      cat("No indicator variable in data frame... \n")
    }
    
    if("Year" %in% nm){
      cat("\nYears:\n")
      print(table(i$Year))
    } else if("year" %in% nm){
      cat("\nYears:\n")
      print(table(i$year))
    }
    
    cat("\n\n")
  }
}
listIndicators(GrChg,GrVal,GrRnk)
listIndicators(IncChg,IncVal,IncRnk)
listIndicators(ProChg,ProVal,ProRnk)
listIndicators(ProIdx)

##LOOK AT THE OVERALLS

merge3 <- function(df1, df2, df3, by, all, suffixes=c(".df1", ".df2", ".df3")){
  m1 <- merge(df1, df2, by=by, all=all, suffixes=suffixes[1:2])
  m2 <- merge(m1, df3, by=by, all=all, suffixes=c("",suffixes[3]))
  return(m2)
}

IncRnk$IncYear <- IncRnk$Year
IncRnk[IncRnk$Year=="2000-2014","Year"] <- "2004-2014"

overall <- merge3(GrRnk, ProRnk, IncRnk, by=c("Year", "CBSA"), all=TRUE)

#why don't names match? -- truncation!
nomatch <- overall[overall$CBSA.Name.df1!=overall$CBSA.Name.df2, c("CBSA.Name", "CBSA.Name.df1", "CBSA.Name.df2")]

library("reshape2")

overall_melted <- melt(overall, id.vars=c("CBSA", "CBSA.Name", "Year"), measure.vars=c("Rank.df1", "Rank.df2", "Rank", "Score.df1", "Score.df2", "Score"))


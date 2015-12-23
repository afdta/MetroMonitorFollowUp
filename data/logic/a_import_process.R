#Notes about data:Inflation adjustment? Not necessary for index, but useful for display

library("reshape2")
library("ggplot2")
library("GGally")
library("metromonitor")

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

metID <- metropops(TRUE, "2013")[c("CBSA_Code","CBSA_Title")]
metID$Geo <- factor(metID$CBSA_Code, levels=metID$CBSA_Code, labels=metID$CBSA_Title)
sum(metID$Geo == metID$CBSA_Title)

##LOOK AT THE OVERALLS

merge3 <- function(df1, df2, df3, by, all, suffixes=c(".df1", ".df2", ".df3")){
  m1 <- merge(df1, df2, by=by, all=all, suffixes=suffixes[1:2])
  m2 <- merge(m1, df3, by=by, all=all, suffixes=c("",suffixes[3]))
  return(m2)
}

GrRnk$Year_ <- GrRnk$Year
ProRnk$Year_ <- ProRnk$Year
IncRnk$Year_ <- IncRnk$Year
IncRnk[IncRnk$Year=="2000-2014","Year"] <- "2004-2014"

overall <- rbind(GrRnk, ProRnk, IncRnk)
overall <- merge(metID, overall, by.x="CBSA_Code", by.y="CBSA")
overall$quintile <- cut(overall$Rank, breaks=c(0, 20, 40, 60, 80, 100), labels=c("First", "Second", "Third", "Fourth", "Fifth"))

overall$orderByGrowth <- reorder(overall$Geo, overall$Score)

hm_theme <- theme_bw() + theme(panel.border = element_blank() ) + theme(axis.text.x=element_text(angle = 45, hjust = 1)) + theme(text=element_text(size=12), panel.grid.major = element_line(colour="#dddddd"))
pdf(file="~/Desktop/MMScores.pdf", width=11, height=17, useDingbats=FALSE)
p <- ggplot(data=overall)
p + geom_tile(aes(x=Composite, y=Geo, fill=quintile)) + 
  scale_fill_manual(values=c('#2c7bb6','#abd9e9','#ffffbf','#fdae61','#d7191c')) + 
  facet_wrap(~ Year, ncol=3) +
  hm_theme

dev.off()

overall_wide <- dcast(overall, CBSA_Code + CBSA_Title + Geo ~ Composite + Year, value.var="Score")
names(overall_wide) <- gsub("-","_",names(overall_wide))

mat <- as.matrix(overall_wide[-1:-3])
source("https://raw.githubusercontent.com/briatte/ggcorr/master/ggcorr.R")
ggcorr(mat, geom="circle")
ggpairs(mat[,c(1,4,7)])

#why don't names match? -- truncation!
#nomatch <- overall[overall$CBSA.Name.df1!=overall$CBSA.Name.df2, c("CBSA.Name", "CBSA.Name.df1", "CBSA.Name.df2")]

#overall_melted <- melt(overall, id.vars=c("CBSA", "CBSA.Name", "Year"), measure.vars=c("Rank.df1", "Rank.df2", "Rank", "Score.df1", "Score.df2", "Score"))


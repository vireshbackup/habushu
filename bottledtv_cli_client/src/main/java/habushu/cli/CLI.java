package habushu.cli;

import com.bottledtv.agent.TheTVDBAgent;

public class CLI
{
    public static void main(String[] args)
    {
        TheTVDBAgent agent = TheTVDBAgent.getInstance();
        System.out.println("Number of series with this name: " + agent.getSeriesByName("The Big Bang Theory").size());
    }
}

